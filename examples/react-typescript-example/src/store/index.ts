import {createStore, combineReducers, applyMiddleware, Store} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import saga from '../saga'
import counter from './counter'
import {combineResources} from 'saga-resource'
import {all, Effect} from 'redux-saga/effects';

const combinedResources = combineResources({counter})

export const rootReducer = combineReducers({
	...combinedResources.reducers
});
	
const rootSaga = function*(): IterableIterator<Effect>{
	yield all([
		saga(),
		...combinedResources.sagas.map((saga): any => saga()),
	])
}

const bindMiddleware = (...middlewares: any[]): any => {
	if (process.env.NODE_ENV !== 'production') {
		return composeWithDevTools(applyMiddleware(...middlewares));
	}
	return applyMiddleware(...middlewares);
};

export type AppState = ReturnType<typeof rootReducer>;

export default function makeStore(initialState?: AppState): Store {
	const sagaMiddleware = createSagaMiddleware();

	const store = createStore(
		rootReducer,
		initialState,
		bindMiddleware(sagaMiddleware)
	);

	sagaMiddleware.run(rootSaga)

	return store;
}
