export const INCREASE = 'counter/INCREASE';

export interface CounterState {
	count: number;
}

export interface IncreaseAction {
	type: typeof INCREASE;
}

// Union type
export type ActionTypes = IncreaseAction;
