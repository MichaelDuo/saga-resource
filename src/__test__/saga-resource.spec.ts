import axios from 'axios';
import {makeResource, SagaResource} from '../index';
import {ResourceState} from '../SagaResource';

function makeResourceState<T>(state: T): ResourceState<T> {
	return Object.assign(state, {
		meta: {loading: false, updating: [] as any, error: null},
	});
}

describe('saga-resource tests', (): void => {
	const RESOURCE_NAME = 'test-resource';
	const inistalState = makeResourceState({
		value: 0,
	});
	const sagaResource = makeResource({
		name: RESOURCE_NAME,
		path: '/test-resource',
		axios: axios,
		state: inistalState,
	});

	it('should return SagaResource if `makeResource` is called', (): void => {
		const resource = makeResource({
			name: 'test',
			state: {},
		});
		expect(resource).toBeInstanceOf(SagaResource);
	});

	it('should initialized correctly', (): void => {
		expect(sagaResource.name).toEqual(RESOURCE_NAME);
		const defaultState = sagaResource.reducer(undefined, {
			type: 'unfound-action-type',
		});
		expect(defaultState.value).toEqual(inistalState.value);
	});

	it('should return set action and if passed to reducer, set the correct value', (): void => {
		const VALUE = 1;
		const action = sagaResource.actions.set({value: VALUE});
		expect(typeof action.type).toBe('string');
		const newState = sagaResource.reducer(inistalState, action);
		expect(newState.value).toEqual(VALUE);
	});
});
