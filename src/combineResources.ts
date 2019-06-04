import {Reducer, Action} from 'redux';
import SagaResource, {ResourceState} from './SagaResource';
import {mapValues, values} from 'lodash';

type ReducersMapObject<S = any, A extends Action = Action> = {
	[K in keyof S]: Reducer<ResourceState<S[K]>, A>
};

type ResourceMapObject<S> = {[K in keyof S]: SagaResource<S[K]>};

interface CombinedReducersAndSagas<S> {
	reducers: ReducersMapObject<S>;
	sagas: any[];
	// makeReducer: <K>(reducer: Reducer<K>) => Reducer<K & ReducersMapObject<S>>;
}

export default function combineResources<S>(
	resources: ResourceMapObject<S>
): CombinedReducersAndSagas<S> {
	const result: CombinedReducersAndSagas<S> = {
		reducers: (mapValues(
			resources,
			(resource: any): any => resource.reducer
		) as unknown) as ReducersMapObject<S>,
		sagas: values(resources).map(
			(resource: any): any => resource.combinedSaga
		) as any[],
	};

	return result;
}
