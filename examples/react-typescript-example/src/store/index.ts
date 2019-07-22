import {createStore, applyMiddleware, Store} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import saga from '../saga';
import counter from './counter';
import user from './user';
import inventory from './inventory';
import {combineResources} from 'saga-resource';

const combinedResources = combineResources({counter, user, inventory});

const rootReducer = combinedResources.combineReducers();

export type AppState = ReturnType<typeof rootReducer>;

const rootSaga = combinedResources.getSaga(saga);

const bindMiddleware = (...middlewares: any[]): any => {
	if (process.env.NODE_ENV !== 'production') {
		return composeWithDevTools(applyMiddleware(...middlewares));
	}
	return applyMiddleware(...middlewares);
};

export default function makeStore(): Store {
	const sagaMiddleware = createSagaMiddleware();

	const store = createStore(rootReducer, bindMiddleware(sagaMiddleware));

	sagaMiddleware.run(rootSaga);

	return store;
}
