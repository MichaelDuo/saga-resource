import {AxiosInstance} from 'axios';

type Parameters<T> = T extends (...args: infer T) => any ? T : never;
// actions
export interface ResourceAction {
	type: string;
	payload?: any;
	options?: any;
}

export interface ResourceActionCreator {
	(payload?: any, options?: any): ResourceAction;
}

export type CustomReducerActions<R> = {
	[K in keyof R]: (payload?: any, options?: any) => ResourceAction
};

export type CustomEffectActions<E> = {
	[K in keyof E]: (...args: Parameters<E[K]>) => ResourceAction
};

export interface BasicActions {
	set: (data: any) => ResourceAction;
	update: (key: string, data: any) => ResourceAction;
	clear: () => ResourceAction;
}
export interface BasicRemoteActions {
	createRequest: ResourceActionCreator;
	updateRequest: ResourceActionCreator;
	fetchRequest: ResourceActionCreator;
	deleteRequest: ResourceActionCreator;
}

export interface ExtendedActions {
	startLoading: () => ResourceAction;
	endLoading: () => ResourceAction;
	startUpdating: (keys: string[]) => ResourceAction;
	endUpdating: (keys: string[]) => ResourceAction;
	setError: (error: ResourceError) => ResourceAction;
	clearError: () => ResourceAction;
}

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

export type Reducers<S, R> = {
	[K in keyof R]: (
		payload: Parameters<R[K]>[0],
		options: {state: S; [key: string]: any}
	) => S
};

export type Effects<E> = {
	[K in keyof E]: (payload: Parameters<E[K]>[0], options: any) => any
};

export type DefaultReducers<S, R> = {[K in keyof R]: (payload: any) => S};

export type DefaultEffects<E> = {[K in keyof E]: (payload: any) => any};

export interface ResourceDefinition<
	S,
	R extends DefaultReducers<S, R>,
	E extends DefaultEffects<E>
> {
	name: string;
	state: S;
	path?: string;
	axios?: AxiosInstance;
	reducers?: Reducers<S, R>;
	effects?: Effects<E>;
}

export interface RemoteActionOptions {
	query?: any;
	params?: any;
	done?: (error?: any, data?: any) => void;
}

export interface BasicRemoteEffect {
	(payload: any, options?: RemoteActionOptions): Iterable<any>;
}
export interface BasicEffects {
	createRequest: BasicRemoteEffect;
	updateRequest: BasicRemoteEffect;
	fetchRequest: BasicRemoteEffect;
	deleteRequest: BasicRemoteEffect;
}

export type CustomEffects<E> = {
	[K in keyof E]: (payload?: Parameters<E[K]>[0], options?: any) => any
};

export interface BasicActionTypes {
	set: string;
	update: string;
	clear: string;
	[key: string]: string;
}
