import {AnyAction} from 'redux';

export function separateBaseURLAndPath(
	pathWithBaseURL: string
): {baseURL: string; path: string} {
	const matches = pathWithBaseURL.match(/^(https?:\/\/)?[^#?\/]+/);
	const baseURL = (matches && matches[0]) || '';
	const path = pathWithBaseURL.slice(baseURL.length);
	return {
		baseURL,
		path,
	};
}

export function wrapEffect(
	effect: (payload: any, options?: any) => Iterable<any>
): (action: AnyAction) => Iterable<any> {
	return function*(action: AnyAction): Iterable<any> {
		yield effect(action.payload, action.options);
	};
}

export const makeActionTypeGenerator = (
	resourceName: string
): ((actionName: string) => string) => (actionName: string): string =>
	`${resourceName}_${actionName}`;
