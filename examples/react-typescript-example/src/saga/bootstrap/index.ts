import {takeEvery, select, Effect} from 'redux-saga/effects';
import {BOOTSTRAP} from './action';
import inventory from '../../store/inventory';
import user from '../../store/user';

export function* bootstrap(): IterableIterator<any> {
	yield user.effects.fetchRequest();
	const state: AppState = yield select();
	yield inventory.effects.fetchRequest(
		{},
		{
			params: {
				username: state.user.username,
			},
		}
	);
}

export default function*(): IterableIterator<Effect> {
	yield takeEvery(BOOTSTRAP, bootstrap);
}
