import {Reducer, combineReducers, ReducersMapObject} from 'redux';
import SagaResource from './SagaResource';
import {mapValues, values} from 'lodash';
import {all, Effect} from 'redux-saga/effects';

type ResourceMapObject<S> = {[K in keyof S]: SagaResource<S[K], any, any>};

interface CombinedReducersAndSagas<S> {
	getSaga: (saga: any) => any;
	combineReducers: <T>(
		reducers?: ReducersMapObject<T, any>
	) => Reducer<T & S>;
}

export default function combineResources<S>(
	resources: ResourceMapObject<S>
): CombinedReducersAndSagas<S> {
	const reducers = (mapValues(
		resources,
		(resource: any): any => resource.reducer
	) as unknown) as ReducersMapObject<S>;

	const result: CombinedReducersAndSagas<S> = {
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
		combineReducers: (reducersMap?: {[key: string]: Reducer}): any => {
			return combineReducers({...reducersMap, ...(reducers as any)});
		},
	};

	return result;
}
