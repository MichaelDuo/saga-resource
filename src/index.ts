import SagaResource, {ResourceDefinition} from './SagaResource';

export {default as combineResources} from './combineResources';

export function makeResource<T, S = {}>(
	resourceDef: ResourceDefinition<T, S>
): SagaResource<T, S> {
	return new SagaResource(resourceDef);
}

export {SagaResource};
