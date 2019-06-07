export function wrapEffect(effect: any): any {
	return function*(action: any): IterableIterator<any> {
		yield effect(action.payload, action.options);
	};
}
