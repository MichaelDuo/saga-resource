import {delay, put} from 'redux-saga/effects';
import {makeResource} from 'saga-resource';

interface CounterState {
	count: number;
}

interface CounterEffects {
	addTwo: (payload: {test: string}) => any;
	addNumberAsync: (payload: number) => any;
}

interface CounterReducers {
	inc: (payload: {test: number}) => CounterState;
	addNumber: (payload: number) => CounterState;
}

const counter = makeResource<CounterState, CounterReducers, CounterEffects>({
	name: 'counter',
	state: {
		count: 0,
	},
	reducers: {
		inc: (_, {state}) => {
			return {...state, ...{count: state.count + 1}};
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
			yield put(counter.actions.addNumber(number));
		},
	},
});

export default counter;
