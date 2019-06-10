import {makeResource} from 'saga-resource';

export interface UserState {
	username: string;
}

export const ERROR_ACTION_TYPE = 'USER_ERROR';

const user = makeResource<UserState, {}, {}>({
	name: 'user',
	path: 'http://localhost:8080/user',
	state: {
		username: 'Uninitialized user',
	},
	effects: {
		*test(): Iterable<any> {
			console.log('yo');
		},
	},
});

export default user;
