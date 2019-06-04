import {all, Effect} from 'redux-saga/effects';
import asyncIncrement from './asyncIncrement'

export default function*(): IterableIterator<Effect> {
    yield all([
        asyncIncrement()
    ])
}