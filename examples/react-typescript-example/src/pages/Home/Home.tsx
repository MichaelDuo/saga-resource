import React, {useEffect} from 'react';
import {UserState} from '../../store/user';

export interface StateProps {
	count: number;
	user: UserState;
	items: {id: string; name: string}[];
	test: any;
}

export interface DispatchProps {
	asyncIncrement: (num: number) => void;
	loadUser: () => void;
	bootstrap: () => void;
}

type Props = StateProps & DispatchProps;

const Home: React.FC<Props> = props => {
	useEffect(() => {
		props.loadUser();
		props.bootstrap();
	}, []);
	return (
		<div>
			<div>Current Count: {props.count}</div>
			<button onClick={() => props.asyncIncrement(1)}>
				Async increment
			</button>
			<div>Username: {props.user.username}</div>
			{props.items.map(item => (
				<div key={item.id}>{item.name}</div>
			))}
		</div>
	);
};

export default Home;
