import {Reducer, AnyAction} from 'redux';
import axios, {AxiosInstance, AxiosError} from 'axios';
import _ from 'lodash'; // import single function
import pathToRexexp from 'path-to-regexp';
import {takeEvery, put, Effect} from 'redux-saga/effects';
import {
	separateBaseURLAndPath,
	wrapEffect,
	makeActionTypeGenerator,
} from './utils';
import constants from './constants';

import {
	ResourceError,
	ResourceMeta,
	ResourceState,
	RemoteActionOptions,
	ResourceAction,
	ResourceDefinition,
	BasicActions,
	BasicEffects,
	CustomEffects,
	ExtendedActions,
	BasicActionTypes,
	BasicRemoteActions,
	CustomReducerActions,
	CustomEffectActions,
	DefaultReducers,
	DefaultEffects,
	EffectOptions,
} from './types';

export default class SagaResource<
	S,
	R extends DefaultReducers<S, R>,
	E extends DefaultEffects<E>
> {
	public static ActionTypes = {
		ERROR: constants.ACTION_TYPE_ERROR,
	};

	public name: string;

	public actions: BasicActions &
		BasicRemoteActions &
		ExtendedActions &
		CustomReducerActions<R> &
		CustomEffectActions<E>;

	// expose for testing and direct use in saga
	public effects: BasicEffects & CustomEffects<E>;

	// expose for testing purposes
	public reducers: any;

	// only intended for combine resources, maybe underscore this?
	// or even from a getter function?
	public combinedSaga: any;
	public reducer: Reducer<ResourceState<S>, AnyAction>; // combined reducer maybe?

	// private properties
	private basicActionTypes: BasicActionTypes;
	private basicActions: BasicActions;

	private resourceDef: ResourceDefinition<S, R, E>;

	private axios: AxiosInstance = axios;
	private baseURL?: string;
	private path?: string;
	private toPathString?: pathToRexexp.PathFunction<object>;

	private actionTypeGenerator: (actionName: string) => string;

	public constructor(resourceDef: ResourceDefinition<S, R, E>) {
		this.name = resourceDef.name;
		this.actionTypeGenerator = makeActionTypeGenerator(this.name);

		this.resourceDef = resourceDef;
		this.axios = resourceDef.axios || this.axios;
		this.reducers = resourceDef.reducers;

		this.effects = this.getEffects();
		if (resourceDef.path) {
			const {path, baseURL} = separateBaseURLAndPath(resourceDef.path);
			this.baseURL = baseURL;
			this.path = path;
			this.toPathString = pathToRexexp.compile(path);
		}

		this.basicActionTypes = this.getActionTypes();
		this.basicActions = this.getBasicActions();
		this.actions = {
			...this.basicActions,
			...this.getExtendedActions(),
			...this.getEffectAndReducerActions(),
		};
		this.reducer = this.getReducer();
		this.combinedSaga = this.getSaga();
	}

	private getActionTypes(): BasicActionTypes {
		return _.transform(
			['set', 'update', 'clear'],
			(result, type): any => {
				result[type] = this.actionTypeGenerator(type);
			},
			{} as any
		);
	}

	private getBasicActions(): BasicActions {
		return {
			set: (data: any): ResourceAction => ({
				type: this.basicActionTypes.set,
				payload: data,
			}),
			update: (key: string, value: any): ResourceAction => ({
				type: this.basicActionTypes.update,
				payload: value,
				options: {
					key,
				},
			}),
			clear: (): ResourceAction => ({
				type: this.basicActionTypes.clear,
			}),
		};
	}

	private getExtendedActions(): ExtendedActions {
		return {
			startLoading: (): ResourceAction =>
				this.basicActions.update('meta.loading', true),
			endLoading: (): ResourceAction =>
				this.basicActions.update('meta.loading', false),
			startUpdating: (keys: string[]): ResourceAction => {
				const updateKeys: Record<string, boolean> = {};
				keys.reduce((acc, cur): Record<string, boolean> => {
					acc[cur] = true;
					return acc;
				}, updateKeys);
				return this.basicActions.update('meta.updating', updateKeys);
			},
			endUpdating: (keys: string[]): ResourceAction => {
				const updateKeys: Record<string, boolean> = {};
				keys.reduce((acc, cur): Record<string, boolean> => {
					acc[cur] = false;
					return acc;
				}, updateKeys);
				return this.basicActions.update('meta.updating', updateKeys);
			},
			setError: (error: ResourceError): ResourceAction => {
				return this.basicActions.update('meta.error', error);
			},
			clearError: (): ResourceAction => {
				return this.basicActions.update('meta.error', null);
			},
		};
	}

	private getEffectAndReducerActions(): BasicRemoteActions &
		CustomReducerActions<R> &
		CustomEffectActions<E> {
		const effects = this.effects || {};
		const {reducers = {}} = this.resourceDef;
		const typeArr = _.keys(effects).concat(_.keys(reducers));
		return typeArr.reduce(
			(acc, type): any => {
				acc[type] = (
					payload: any = {},
					options: any = {}
				): ResourceAction => ({
					type: this.actionTypeGenerator(type),
					payload,
					options,
				});
				return acc;
			},
			{} as any
		);
	}

	private getReducer(): Reducer<ResourceState<S>, AnyAction> {
		const defaultMeta: ResourceMeta = {
			loading: false,
			updating: {},
			error: null,
		};
		const initialState = _.assign({}, this.resourceDef.state, {
			meta: defaultMeta,
		});
		let customReducers = this.reducers;
		customReducers = _.transform(
			customReducers as {[key: string]: any},
			(result, value, key): any => {
				result[this.actionTypeGenerator(key)] = value;
			},
			{} as any
		);
		return (
			state: ResourceState<S> = _.cloneDeep(initialState),
			action: AnyAction
		): ResourceState<S> => {
			if (customReducers && customReducers[action.type]) {
				return customReducers[action.type](action.payload, {state});
			}
			switch (action.type) {
				case this.basicActionTypes.set:
					return {...state, ...action.payload};
				case this.basicActionTypes.update: {
					let newState;
					const target = _.get(state, action.options.key);
					if (
						target &&
						_.isPlainObject(target) &&
						_.isPlainObject(action.payload)
					) {
						newState = _.set(state, action.options.key, {
							...target,
							...action.payload,
						});
					} else {
						newState = _.set(
							state as any,
							action.options.key,
							action.payload
						);
					}
					return {...newState};
				}
				case this.basicActionTypes.clear:
					return _.cloneDeep(initialState);
				default:
					return state;
			}
		};
	}

	private getEffects(): BasicEffects & CustomEffects<E> {
		const self = this;
		const methodMap: {[key: string]: string} = {
			createRequest: 'post',
			updateRequest: 'patch',
			fetchRequest: 'get',
			deleteRequest: 'delete',
		};
		const rawEffects = {
			..._.transform(
				[
					'createRequest',
					'updateRequest',
					'fetchRequest',
					'deleteRequest',
				],
				(result, key): any => {
					result[key] = function*(
						payload?: any,
						options?: RemoteActionOptions
					): Iterable<any> {
						if (!self.path || !self.axios || !self.toPathString) {
							throw new Error('Can not find path or axios');
						}
						const path = self.toPathString(
							options && options.params
						);
						const response = yield self.axios(
							_.pickBy(
								{
									method: methodMap[key] as any,
									baseURL: self.baseURL,
									url: path,
									params: options && options.query,
									data: payload,
								},
								_.identity
							)
						);
						if (key === 'fetchRequest')
							yield put(
								self.actions.set(_.get(response, 'data'))
							);
						return _.get(response, 'data');
					};
				},
				{} as any
			),
			...self.resourceDef.effects,
		};
		const wrapEffects = (effects: any): any => {
			return _.transform(
				effects,
				(result, value: any, key: string): any => {
					result[key] = self.wrapEffect(value);
				},
				{} as any
			);
		};
		return wrapEffects(rawEffects);
	}

	private wrapEffect(effect: any): any {
		const self = this;
		return function*(
			payload: any,
			options: EffectOptions,
			...args: any[]
		): any {
			let error: any = null;
			let result: any = null;
			let shouldHandleLoading = _.get(options, 'handleLoading') !== false;
			if (shouldHandleLoading) yield put(self.actions.startLoading());
			try {
				result = yield effect(payload, options, ...args);
			} catch (err) {
				error = err;
				throw err;
			} finally {
				if (shouldHandleLoading) yield put(self.actions.endLoading());
				if (options && options.done) options.done(error, result);
			}
			return result;
		};
	}

	private getSaga(): any {
		// TODO: fetch request should only take leading actions
		const self = this;
		return function*(): Iterable<Effect> {
			const keys = Object.keys(self.effects);
			for (const key of keys) {
				yield takeEvery(
					self.basicActionTypes[key] || self.actionTypeGenerator(key),
					self.wrapSaga((self.effects as any)[key])
				);
			}
		};
	}

	private wrapSaga(effect: any): any {
		const self = this;
		return function*(action: AnyAction): Iterable<any> {
			try {
				yield effect(action.payload, action.options);
			} catch (err) {
				yield self.handleError(err);
			}
		};
	}

	private *handleError(err: any): Iterable<any> {
		let error;
		if (_.get(err, 'response.data')) {
			error = {
				status: _.get(err, 'response.status', 0),
				data: _.get(err, 'response.data', {}),
			};
		} else {
			error = {
				status: 500,
				data: err.message,
			};
		}
		yield put(this.actions.setError(error));
		yield put({
			type: SagaResource.ActionTypes.ERROR,
			payload: {error: err},
		});
	}
}
