import {ResourceDefinition} from './types';
import SagaResource from './SagaResource';

export {default as combineResources} from './combineResources';

export function makeResource<S, R, E>(
	resourceDef: ResourceDefinition<S, R, E>
): SagaResource<S, R, E> {
	return new SagaResource(resourceDef);
}

export {SagaResource};
