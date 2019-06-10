import {ResourceDefinition, DefaultReducers, DefaultEffects} from './types';
import SagaResource from './SagaResource';

export {default as combineResources} from './combineResources';

export function makeResource<
	S,
	R extends DefaultReducers<S, R>,
	E extends DefaultEffects<E>
>(resourceDef: ResourceDefinition<S, R, E>): SagaResource<S, R, E> {
	return new SagaResource<S, R, E>(resourceDef);
}

export {SagaResource};
