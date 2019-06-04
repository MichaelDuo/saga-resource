import {takeEvery, Effect, delay, select, put} from 'redux-saga/effects';
import {ASYNC_INCREMENT, AsyncIncrementAction} from './action'
import {AppState} from '../../store'
import counter from '../../store/counter'

export function* asyncIncrement(action: AsyncIncrementAction): IterableIterator<Effect> {
    yield delay(500);
    const state:AppState = yield select()
    yield put(counter.actions.update(state.counter.count+1, 'count'))
}

export default function*():IterableIterator<Effect>{
    yield takeEvery(ASYNC_INCREMENT, asyncIncrement)
}