import {takeEvery, Effect, delay} from 'redux-saga/effects';
import {ASYNC_INCREMENT, AsyncIncrementAction} from './action'

export function* asyncIncrement(action: AsyncIncrementAction): IterableIterator<Effect> {
    yield delay(500);
    console.log(action.payload);
}

export default function*():IterableIterator<Effect>{
    yield takeEvery(ASYNC_INCREMENT, asyncIncrement)
}