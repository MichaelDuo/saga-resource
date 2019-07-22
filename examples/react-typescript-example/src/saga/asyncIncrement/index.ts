import {takeEvery, Effect, put} from 'redux-saga/effects';
import {ASYNC_INCREMENT, AsyncIncrementAction} from './action';
import counter from '../../store/counter';

export function* asyncIncrement(
	action: AsyncIncrementAction
): IterableIterator<Effect> {
	// yield delay(500);
	// const state: AppState = yield select();
	// yield put(counter.actions.update(state.counter.count + 1, 'count'));
	yield put(counter.actions.addNumberAsync(200));
	yield counter.effects.addNumberAsync(200);
}

export default function*(): IterableIterator<Effect> {
	yield takeEvery(ASYNC_INCREMENT, asyncIncrement);
}
