import {INCREASE, CounterState, ActionTypes} from './types';

const initialState: CounterState = {count: 0};

export default function counterReducer(
	state = initialState,
	action: ActionTypes
): CounterState {
	switch (action.type) {
		case INCREASE:
			return {...state, ...{count: state.count + 1}};
		default:
			return state;
	}
}
