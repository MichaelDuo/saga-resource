import {all, Effect} from 'redux-saga/effects';
import asyncIncrement from './asyncIncrement';
import bootstrap from './bootstrap';

export default function*(): IterableIterator<Effect> {
	yield all([asyncIncrement(), bootstrap()]);
}
