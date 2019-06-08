import {Reducer, AnyAction} from 'redux';
import {AxiosInstance} from 'axios';

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
	options?: any;
}

export interface ResourceUpdateAction extends ResourceAction {
	key: string;
	payload: any;
}

export interface ResourceRemoteAction extends ResourceAction {
	options: RemoteActionOptions;
}

export type Effects<T> = {[K in keyof T]: (action: AnyAction) => any};

export interface ResourceDefinition<
	S,
	R = {[name: string]: Reducer},
	E = {[effectType: string]: () => Iterable<any>}
> {
	name: string;
	state: S;
	path?: string;
	axios?: AxiosInstance;
	effects?: Effects<E>;
	reducers?: R;
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

export interface BasicEffects {
	createRequest: (payload: any) => IterableIterator<any>;
	updateRequest: (payload: any) => IterableIterator<any>;
	fetchRequest: (payload: any) => IterableIterator<any>;
	deleteRequest: (payload: any) => IterableIterator<any>;
}

export interface BasicActionTypes {
	set: string;
	update: string;
	clear: string;
	createRequest: string;
	updateRequest: string;
	fetchRequest: string;
	deleteRequest: string;
	[key: string]: string;
}

export interface ObjectWithType<T> {
	[key: string]: T;
}

export type CustomActions<T> = {[K in keyof T]: (data?: any) => ResourceAction};
export type ReducerActions<T> = {[K in keyof T]: (payload?: any) => AnyAction};
