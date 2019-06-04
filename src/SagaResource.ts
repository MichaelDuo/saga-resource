import {Reducer, AnyAction} from 'redux';
import {AxiosInstance, AxiosError} from 'axios';
import _ from 'lodash';
import pathToRexexp from 'path-to-regexp';
import {takeEvery, put, takeLeading, Effect} from 'redux-saga/effects';

export interface ResourceError {
	status: number;
	data: any;
}
export interface ResourceMeta {
	loading: boolean;
	updating: {[key: string]: boolean};
	error: ResourceError | null;
}

export type ResourceState<T> = {
	meta: ResourceMeta;
} & T;

export interface RemoteActionOptions {
	query?: any;
	params?: any;
	done?: (error?: any, data?: any) => void;
}

export interface ResourceAction {
	type: string;
	payload?: any;
}

export interface ResourceUpdateAction extends ResourceAction {
	path: string;
	payload: any;
}

export interface ResourceRemoteAction extends ResourceAction {
	query?: any;
	params?: any;
	done?: (error?: any, data?: any) => void;
}

type Effects<T> = {[K in keyof T]: (action: AnyAction) => any};

export interface ResourceDefinition<
	T,
	S = {[effectType: string]: () => Iterable<any>}
> {
	name: string;
	state: T;
	path?: string;
	axios?: AxiosInstance;
	effects?: Effects<S>;
}

export interface BasicActions {
	set: (data: any) => ResourceAction;
	update: (data: any, path: string) => ResourceAction;
	clear: () => ResourceAction;
	createRequest: (
		data: any,
		options?: RemoteActionOptions
	) => ResourceRemoteAction;
	updateRequest: (
		data: any,
		options?: RemoteActionOptions
	) => ResourceRemoteAction;
	fetchRequest: (options?: RemoteActionOptions) => ResourceRemoteAction;
	deleteRequest: (
		data?: any,
		options?: RemoteActionOptions
	) => ResourceRemoteAction;
}

export interface ExtendedActions {
	startLoading: () => ResourceAction;
	endLoading: () => ResourceAction;
	startUpdating: (keys: string[]) => ResourceAction;
	endUpdating: (keys: string[]) => ResourceAction;
	setError: (error: ResourceError) => ResourceAction;
	clearError: () => ResourceAction;
}

export interface BasicActionTypes {
	set: string;
	update: string;
	clear: string;
	createRequest: string;
	updateRequest: string;
	fetchRequest: string;
	deleteRequest: string;
}

export interface ObjectWithType<T> {
	[key: string]: T;
}

type CustomActions<T> = {[K in keyof T]: (data?: any) => ResourceAction};

export default class SagaResource<T, S = {}> {
	private resourceDef: ResourceDefinition<T, S>;

	public name: string;

	public basicActionTypes: BasicActionTypes;

	public actions: BasicActions & ExtendedActions & CustomActions<S>;

	public reducer: Reducer<ResourceState<T>, AnyAction>;

	public combinedSaga: any;

	protected axios?: AxiosInstance;

	protected path?: string;

	protected toPathString?: pathToRexexp.PathFunction<object>;

	public constructor(resourceDef: ResourceDefinition<T, S>) {
		this.name = resourceDef.name;
		this.resourceDef = resourceDef;
		this.axios = resourceDef.axios;
		this.path = resourceDef.path;
		if (this.path) {
			this.toPathString = pathToRexexp.compile(this.path);
		}

		this.basicActionTypes = this.getActionTypes();
		this.actions = {
			...this.getBaiscActions(),
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

	private getBaiscActions(): BasicActions {
		return {
			set: (data: any): ResourceAction => ({
				type: this.basicActionTypes.set,
				payload: data,
			}),
			update: (data: any, path: string): ResourceUpdateAction => ({
				type: this.basicActionTypes.update,
				payload: data,
				path,
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
				path: 'meta.loading',
				payload: true,
			}),
			endLoading: (): ResourceUpdateAction => ({
				type: this.basicActionTypes.update,
				path: 'meta.loading',
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
					path: `meta.updating`,
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
					path: `meta.updating`,
					payload: updateKeys,
				};
			},
			setError: (error: ResourceError): ResourceUpdateAction => {
				return {
					type: this.basicActionTypes.update,
					path: 'meta.error',
					payload: error,
				};
			},
			clearError: (): ResourceUpdateAction => {
				return {
					type: this.basicActionTypes.update,
					path: 'meta.error',
					payload: null,
				};
			},
		};
	}

	private getCustomActions(): CustomActions<S> {
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
		return result;
	}

	private getReducer(): Reducer<ResourceState<T>, AnyAction> {
		const defaultMeta: ResourceMeta = {
			loading: false,
			updating: {},
			error: null,
		};
		const initialState = _.assign({}, this.resourceDef.state, {
			meta: defaultMeta,
		});
		return (
			state: ResourceState<T> = _.cloneDeep(initialState),
			action: AnyAction
		): ResourceState<T> => {
			switch (action.type) {
				case this.basicActionTypes.set:
					return {...state, ...action.payload};
				case this.basicActionTypes.update: {
					let newState;
					const target = _.get(state, action.path);
					if (
						target &&
						_.isPlainObject(target) &&
						_.isPlainObject(action.payload)
					) {
						newState = _.set(state, action.path, {
							...target,
							...action.payload,
						});
					} else {
						newState = _.set(
							state as any,
							action.path,
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

	private getSaga(): any {
		const that = this;
		/**
		 * Create will not set resource, you should process it from callback or refetch again
		 *  */
		function* createRequest(action: ResourceRemoteAction): Iterable<any> {
			yield that.actions.clearError();
			if (!that.path || !that.axios || !that.toPathString) {
				throw new Error('Can not find path or axios');
			}
			const path = that.toPathString(action.params);

			let error: any = null;
			let data: any = null;
			try {
				yield put(that.actions.startLoading());
				data = yield that.axios({
					method: 'post',
					url: path,
					params: action.query,
					data: action.payload,
				});
			} catch (e) {
				error = e;
				yield that.handleError(e);
			} finally {
				yield put(that.actions.endLoading());
				action.done && action.done(error, data);
			}
		}

		/**
		 * Update will not set resource, you should process it from callback or refetch again
		 *  */
		function* updateRequest(action: ResourceRemoteAction): Iterable<any> {
			yield that.actions.clearError();
			if (!that.path || !that.axios || !that.toPathString) {
				throw new Error('Can not find path or axios');
			}
			const path = that.toPathString(action.params);

			let error: any = null;
			let data: any = null;
			try {
				data = yield that.axios({
					method: 'patch',
					url: path,
					params: action.query,
					data: action.payload,
				});
			} catch (e) {
				error = e;
				yield that.handleError(e);
			} finally {
				action.done && action.done(error, data);
			}
		}

		function* fetchRequest(action: ResourceRemoteAction): Iterable<any> {
			yield that.actions.clearError();
			if (!that.path || !that.axios || !that.toPathString) {
				throw new Error('Can not find path or axios');
			}
			const path = that.toPathString(action.params);

			let error: any = null;
			let data: any = null;
			try {
				yield put(that.actions.startLoading());
				data = yield that.axios({
					method: 'get',
					url: path,
					params: action.query,
				});
				yield put(that.actions.set(data));
			} catch (e) {
				error = e;
				yield that.handleError(e);
			} finally {
				yield put(that.actions.endLoading());
				action.done && action.done(error, data);
			}
		}

		/**
		 * Delete will not set resource, you should process it from callback or refetch again
		 *  */
		function* deleteRequest(action: ResourceRemoteAction): Iterable<any> {
			yield that.actions.clearError();
			if (!that.path || !that.axios || !that.toPathString) {
				throw new Error('Can not find path or axios');
			}
			const path = that.toPathString(action.params);

			let error: any = null;
			let data: any = null;
			try {
				yield put(that.actions.startLoading());
				data = yield that.axios({
					method: 'delete',
					url: path,
					params: action.query,
					data: action.payload,
				});
			} catch (e) {
				error = e;
				yield that.handleError(e);
			} finally {
				yield put(that.actions.endLoading());
				action.done && action.done(error, data);
			}
		}

		return function*(): Iterable<Effect> {
			yield takeEvery(that.basicActionTypes.createRequest, createRequest);
			yield takeEvery(that.basicActionTypes.updateRequest, updateRequest);
			yield takeLeading(that.basicActionTypes.fetchRequest, fetchRequest);
			yield takeEvery(that.basicActionTypes.deleteRequest, deleteRequest);
			if (that.resourceDef.effects) {
				const {effects} = that.resourceDef;
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
