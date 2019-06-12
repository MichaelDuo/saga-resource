import {AxiosInstance} from 'axios';

type Parameters<T> = T extends (...args: infer T) => any ? T : never;
export interface ResourceAction {
	type: string;
	payload?: any;
	options?: EffectOptions;
}

export interface ResourceActionCreator {
	(payload?: any, options?: EffectOptions): ResourceAction;
}

export type CustomReducerActions<R> = {
	[K in keyof R]: (
		payload: Parameters<R[K]>[0],
		options?: EffectOptions
	) => ResourceAction
};

export type CustomEffectActions<E> = {
	[K in keyof E]: (
		payload: Parameters<E[K]>[0],
		options?: EffectOptions
	) => ResourceAction
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

export interface EffectOptions {
	handleLoading?: boolean;
	// handleError?: boolean;
	done?: (error?: any, data?: any) => void;
	[key: string]: any;
}

export interface RemoteActionOptions extends EffectOptions {
	query?: any;
	params?: any;
}

export interface BasicRemoteEffect {
	(payload?: any, options?: RemoteActionOptions): Iterable<any>;
}
export interface BasicEffects {
	createRequest: BasicRemoteEffect;
	updateRequest: BasicRemoteEffect;
	fetchRequest: BasicRemoteEffect;
	deleteRequest: BasicRemoteEffect;
}

export type CustomEffects<E> = {
	[K in keyof E]: (
		payload?: Parameters<E[K]>[0],
		options?: EffectOptions
	) => any
};

export interface BasicActionTypes {
	set: string;
	update: string;
	clear: string;
	[key: string]: string;
}
