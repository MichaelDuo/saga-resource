import {Reducer, Action} from 'redux';
import SagaResource, {ResourceState} from './SagaResource';

type ReducersMapObject<S = any, A extends Action = Action> = {
	[K in keyof S]: Reducer<ResourceState<S[K]>, A>
};

type ResourceMapObject<S> = {[K in keyof S]: SagaResource<S[K]>};

interface CombinedReducersAndSagas<S> {
	reducers: ReducersMapObject<S>;
	sagas: any[];
}

export default function combineResources<S>(
	resources: ResourceMapObject<S>
): CombinedReducersAndSagas<S> {
	const result: CombinedReducersAndSagas<S> = {
		reducers: {} as any,
		sagas: [],
	};

	const resourcesObject = (resources as unknown) as any;

	Object.keys(resourcesObject).forEach(
		(key): void => {
			const resource = resourcesObject[key];
			Object.assign(result.reducers, {[key]: resource.reducer});
			result.sagas.push(resource.saga);
		}
	);
	return result;
}
