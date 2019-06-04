import {createStore, combineReducers, applyMiddleware, Store} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import counterReducer from './counter/reducer';
import rootSaga from '../saga'

export const rootReducer = combineReducers({
	counter: counterReducer,
});

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
