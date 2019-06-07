import {Reducer, AnyAction} from 'redux';
import {AxiosInstance, AxiosError} from 'axios';
import _ from 'lodash';
import pathToRexexp from 'path-to-regexp';
import {takeEvery, put, takeLeading, Effect} from 'redux-saga/effects';

import {
	ResourceError,
	ResourceMeta,
	ResourceState,
	RemoteActionOptions,
	ResourceAction,
	ResourceUpdateAction,
	ResourceRemoteAction,
	ResourceDefinition,
	BasicActions,
	ExtendedActions,
	BasicActionTypes,
	ObjectWithType,
	CustomActions,
	ReducerActions,
} from './types';

export default class SagaResource<S, R = {}, E = {}> {
	private resourceDef: ResourceDefinition<S, R, E>;

	public name: string;

	public basicActionTypes: BasicActionTypes;

	public actions: BasicActions &
		ExtendedActions &
		CustomActions<E> &
		ReducerActions<R>;

	public reducer: Reducer<ResourceState<S>, AnyAction>;

	public reducers: any;

	// public effects:

	public combinedSaga: any;

	protected axios?: AxiosInstance;

	protected path?: string;

	protected toPathString?: pathToRexexp.PathFunction<object>;

	public constructor(resourceDef: ResourceDefinition<S, R, E>) {
		this.name = resourceDef.name;
		this.resourceDef = resourceDef;
		this.axios = resourceDef.axios;
		this.path = resourceDef.path;
		this.reducers = resourceDef.reducers;
		if (this.path) {
			this.toPathString = pathToRexexp.compile(this.path);
		}

		this.basicActionTypes = this.getActionTypes();
		this.actions = {
			...this.getBasicActions(),
			...this.getExtendedActions(),
			...this.getCustomActions(),
		};
		this.reducer = this.getReducer();
		this.combinedSaga = this.getSaga();
	}

	private getActionTypes(): BasicActionTypes {
		return {
			set: `SET_${this.resourceDef.name}`,
			update: `UPDATE_${this.resourceDef.name}`,
			clear: `CLEAR_${this.resourceDef.name}`,
			createRequest: `CREATE_REQUEST_${this.resourceDef.name}`,
			updateRequest: `UPDATE_REQUEST_${this.resourceDef.name}`,
			fetchRequest: `FETCH_REQUEST_${this.resourceDef.name}`,
			deleteRequest: `DELETE_REQUEST_${this.resourceDef.name}`,
		};
	}

	private getBasicActions(): BasicActions {
		return {
			set: (data: any): ResourceAction => ({
				type: this.basicActionTypes.set,
				payload: data,
			}),
			update: (key: string, value: any): ResourceUpdateAction => ({
				type: this.basicActionTypes.update,
				key,
				payload: value,
			}),
			clear: (): ResourceAction => ({
				type: this.basicActionTypes.clear,
			}),
			createRequest: (
				data: any,
				options?: RemoteActionOptions
			): ResourceRemoteAction => ({
				type: this.basicActionTypes.createRequest,
				payload: data,
				...options,
			}),
			updateRequest: (
				data: any,
				options?: RemoteActionOptions
			): ResourceRemoteAction => ({
				type: this.basicActionTypes.updateRequest,
				payload: data,
				...options,
			}),
			fetchRequest: (
				options?: RemoteActionOptions
			): ResourceRemoteAction => ({
				type: this.basicActionTypes.fetchRequest,
				...options,
			}),
			deleteRequest: (
				data?: any,
				options?: RemoteActionOptions
			): ResourceRemoteAction => ({
				type: this.basicActionTypes.deleteRequest,
				payload: data,
				...options,
			}),
		};
	}

	private getExtendedActions(): ExtendedActions {
		return {
			startLoading: (): ResourceUpdateAction => ({
				type: this.basicActionTypes.update,
				key: 'meta.loading',
				payload: true,
			}),
			endLoading: (): ResourceUpdateAction => ({
				type: this.basicActionTypes.update,
				key: 'meta.loading',
				payload: false,
			}),
			startUpdating: (keys: string[]): ResourceUpdateAction => {
				const updateKeys: ObjectWithType<boolean> = {};
				keys.reduce((acc, cur): ObjectWithType<boolean> => {
					acc[cur] = true;
					return acc;
				}, updateKeys);

				return {
					type: this.basicActionTypes.update,
					key: `meta.updating`,
					payload: updateKeys,
				};
			},
			endUpdating: (keys: string[]): ResourceUpdateAction => {
				const updateKeys: ObjectWithType<boolean> = {};
				keys.reduce((acc, cur): ObjectWithType<boolean> => {
					acc[cur] = false;
					return acc;
				}, updateKeys);

				return {
					type: this.basicActionTypes.update,
					key: `meta.updating`,
					payload: updateKeys,
				};
			},
			setError: (error: ResourceError): ResourceUpdateAction => {
				return {
					type: this.basicActionTypes.update,
					key: 'meta.error',
					payload: error,
				};
			},
			clearError: (): ResourceUpdateAction => {
				return {
					type: this.basicActionTypes.update,
					key: 'meta.error',
					payload: null,
				};
			},
		};
	}

	private getCustomActions(): ReducerActions<R> & CustomActions<E> {
		const result = {} as any;
		if (this.resourceDef.effects) {
			const {effects} = this.resourceDef;
			Object.keys(effects).forEach(
				(type): void => {
					result[type] = (data: any): ResourceAction => ({
						type,
						payload: data,
					});
				}
			);
		}
		if (this.resourceDef.reducers) {
			const {reducers} = this.resourceDef;
			Object.keys(reducers).forEach(
				(type): void => {
					result[type] = (data: any): ResourceAction => ({
						type,
						payload: data,
					});
				}
			);
		}
		return result;
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
		return (
			state: ResourceState<S> = _.cloneDeep(initialState),
			action: AnyAction
		): ResourceState<S> => {
			if (this.reducers && this.reducers[action.type]) {
				return this.reducers[action.type](state, action.payload);
			}
			switch (action.type) {
				case this.basicActionTypes.set:
					return {...state, ...action.payload};
				case this.basicActionTypes.update: {
					let newState;
					const target = _.get(state, action.key);
					if (
						target &&
						_.isPlainObject(target) &&
						_.isPlainObject(action.payload)
					) {
						newState = _.set(state, action.key, {
							...target,
							...action.payload,
						});
					} else {
						newState = _.set(
							state as any,
							action.key,
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

	private getEffects(): any {
		// should not accept an action, should accept payload, get saga should wrap those effects
		const self = this;
		return {
			/**
			 * Create will not set resource, you should process it from callback or refetch again
			 *  */
			createRequest: function*(
				action: ResourceRemoteAction
			): Iterable<any> {
				yield self.actions.clearError();
				if (!self.path || !self.axios || !self.toPathString) {
					throw new Error('Can not find path or axios');
				}
				const path = self.toPathString(action.params);

				let error: any = null;
				let data: any = null;
				try {
					yield put(self.actions.startLoading());
					data = yield self.axios({
						method: 'post',
						url: path,
						params: action.query,
						data: action.payload,
					});
				} catch (e) {
					error = e;
					yield self.handleError(e);
				} finally {
					yield put(self.actions.endLoading());
					action.done && action.done(error, data);
				}
			},

			/**
			 * Update will not set resource, you should process it from callback or refetch again
			 *  */
			updateRequest: function*(
				action: ResourceRemoteAction
			): Iterable<any> {
				yield self.actions.clearError();
				if (!self.path || !self.axios || !self.toPathString) {
					throw new Error('Can not find path or axios');
				}
				const path = self.toPathString(action.params);

				let error: any = null;
				let data: any = null;
				try {
					data = yield self.axios({
						method: 'patch',
						url: path,
						params: action.query,
						data: action.payload,
					});
				} catch (e) {
					error = e;
					yield self.handleError(e);
				} finally {
					action.done && action.done(error, data);
				}
			},

			fetchRequest: function*(
				action: ResourceRemoteAction
			): Iterable<any> {
				yield self.actions.clearError();
				if (!self.path || !self.axios || !self.toPathString) {
					throw new Error('Can not find path or axios');
				}
				const path = self.toPathString(action.params);

				let error: any = null;
				let data: any = null;
				try {
					yield put(self.actions.startLoading());
					data = yield self.axios({
						method: 'get',
						url: path,
						params: action.query,
					});
					yield put(self.actions.set(data));
				} catch (e) {
					error = e;
					yield self.handleError(e);
				} finally {
					yield put(self.actions.endLoading());
					action.done && action.done(error, data);
				}
			},

			/**
			 * Delete will not set resource, you should process it from callback or refetch again
			 *  */
			deleteRequest: function*(
				action: ResourceRemoteAction
			): Iterable<any> {
				yield self.actions.clearError();
				if (!self.path || !self.axios || !self.toPathString) {
					throw new Error('Can not find path or axios');
				}
				const path = self.toPathString(action.params);

				let error: any = null;
				let data: any = null;
				try {
					yield put(self.actions.startLoading());
					data = yield self.axios({
						method: 'delete',
						url: path,
						params: action.query,
						data: action.payload,
					});
				} catch (e) {
					error = e;
					yield self.handleError(e);
				} finally {
					yield put(self.actions.endLoading());
					action.done && action.done(error, data);
				}
			},
		};
	}

	private getSaga(): any {
		const {
			createRequest,
			updateRequest,
			fetchRequest,
			deleteRequest,
		} = this.getEffects();

		const self = this;
		return function*(): Iterable<Effect> {
			yield takeEvery(self.basicActionTypes.createRequest, createRequest);
			yield takeEvery(self.basicActionTypes.updateRequest, updateRequest);
			yield takeLeading(self.basicActionTypes.fetchRequest, fetchRequest);
			yield takeEvery(self.basicActionTypes.deleteRequest, deleteRequest);
			if (self.resourceDef.effects) {
				const {effects} = self.resourceDef;
				const keys = Object.keys(effects);
				for (const key of keys) {
					yield takeEvery(key, (effects as any)[key]);
				}
			}
		};
	}

	private *handleError(axiosError: AxiosError): Iterable<any> {
		const error = {
			status: _.get(axiosError, 'response.status', 0),
			data: _.get(axiosError, 'response.data', {}),
		};
		yield put(this.actions.setError(error));
	}
}
