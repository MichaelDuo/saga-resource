saga-resource
=============
[![npm][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![codecov][codecov-image]][codecov-url]

## What it is
saga-resource is a store that works together with redux and redux-saga, with miminal boilerplates, it automatically fetches your remote resources with flexibility for you to assemble your model, and offers CURD methods that could free you from writting trivial actions and reducers.

## What it is not
saga-resource should not be the place to handle complicated, inter-resources, side effects. The effects in each resource file should serve the purpose of assembling the model, and there should be no dependencies between resources.

## How to use it
Take a overlook [here](http://www.xmind.net/m/VunsFm)

### Make your resource
```javascript
// ./store/counter.ts
import {makeResource} from 'saga-resource';
import {delay, put} from 'redux-saga/effects';

interface CounterState {
	count: number;
}
interface CounterReducers {
    addNumber: (payload: number) => CounterState;
}
interface CounterEffects {
    addNumberAsync: (payload: number) => any;
}

const counter = makeResource<CounterState, CounterReducers, CounterEffects>({
    name: 'counter',
    path: 'https://www.yourhostname.com/api/count/:username',
	state: {
		count: 0,
	},
	reducers: {
		addNumber: (number, {state}) => {
			return {...state, ...{count: state.count + number}};
		},
	},
	effects: {
		*addNumberAsync(number): any {
			yield delay(500);
			yield put(counter.actions.addNumber(number));
		},
	},
});
```

You can get it's actions by
```javascript
const actionForReducer = counter.actions.addNumber(3)
const actionForEffect = counter.action.addNumberAsync(3)
```

You can get it's effects and yiled it in your saga file by
```javascript
yield counter.effects.addNumberAsync(3)
```

Saga-resource provides 


## How to install it
TBC

## Best prcatices
TBC

## Integration with your current redux and redux-saga project
TBC

[npm-image]: https://img.shields.io/npm/v/saga-resource.svg?style=flat
[npm-url]: https://www.npmjs.com/package/saga-resource
[travis-image]: https://travis-ci.com/MichaelDuo/saga-resource.svg?branch=master
[travis-url]: https://travis-ci.com/MichaelDuo/saga-resource
[codecov-image]: https://codecov.io/gh/michaelduo/saga-resource/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/MichaelDuo/saga-resource