import {createStore, applyMiddleware, Store} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import saga from '../saga';
import counter from './counter';
import {combineResources} from 'saga-resource';

const combinedResources = combineResources({counter});

const rootReducer = combinedResources.getReducer();

export type AppState = ReturnType<typeof rootReducer>;

const rootSaga = combinedResources.getSaga(saga);

const bindMiddleware = (...middlewares: any[]): any => {
	if (process.env.NODE_ENV !== 'production') {
		return composeWithDevTools(applyMiddleware(...middlewares));
	}
	return applyMiddleware(...middlewares);
};

export default function makeStore(initialState?: AppState): Store {
	const sagaMiddleware = createSagaMiddleware();

	const store = createStore(
		rootReducer,
		initialState,
		bindMiddleware(sagaMiddleware)
	);

	sagaMiddleware.run(rootSaga);

	return store;
}
