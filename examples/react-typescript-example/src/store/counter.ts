import {delay, put} from 'redux-saga/effects';
import {makeResource} from 'saga-resource';

interface CounterState {
	count: number;
}

interface CounterReducers {
	inc: (num: number) => CounterState;
	addNumber: (payload: number) => CounterState;
}

interface CounterEffects {
	addTwo: () => any;
	addNumberAsync: (payload: number) => any;
}

const counter = makeResource<CounterState, CounterReducers, CounterEffects>({
	name: 'counter',
	state: {
		count: 0,
	},
	reducers: {
		inc: (num = 1, {state}) => {
			return {...state, ...{count: state.count + num}};
		},
		addNumber: (number, {state}) => {
			return {...state, ...{count: state.count + number}};
		},
	},
	effects: {
		*addTwo(): any {
			console.log('add two');
		},
		*addNumberAsync(number): any {
			yield delay(500);
			throw new Error('123');
			yield put(counter.actions.addNumber(number));
		},
	},
});

export default counter;
