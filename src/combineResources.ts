import {Reducer, Action, combineReducers} from 'redux';
import {ResourceState} from './types';
import SagaResource from './SagaResource';
import {mapValues, values} from 'lodash';
import {all, Effect} from 'redux-saga/effects';

type ReducersMapObject<S = any, A extends Action = Action> = {
	[K in keyof S]: Reducer<ResourceState<S[K]>, A>
};

type ResourceMapObject<S> = {[K in keyof S]: SagaResource<S[K]>};

interface CombinedReducersAndSagas<S> {
	getReducer: <K>(rootReducer?: Reducer<K>) => Reducer<K & S>;
	getSaga: (saga: any) => any;
}

export default function combineResources<S>(
	resources: ResourceMapObject<S>
): CombinedReducersAndSagas<S> {
	const reducers = (mapValues(
		resources,
		(resource: any): any => resource.reducer
	) as unknown) as ReducersMapObject<S>;

	const result: CombinedReducersAndSagas<S> = {
		getReducer: (rootReducer?: any): any => {
			const combinedReducer = combineReducers(reducers as any);
			return function(state: any, action: any): any {
				if (rootReducer) {
					return Object.assign(
						rootReducer(state, action),
						combinedReducer(state, action)
					);
				} else {
					return combinedReducer(state, action);
				}
			};
		},
		getSaga: (rootSaga?: any): any => {
			return function*(): IterableIterator<Effect> {
				yield all([
					rootSaga(),
					...values(resources).map(
						(resource: any): any => {
							return resource.combinedSaga();
						}
					),
				]);
			};
		},
	};

	return result;
}
