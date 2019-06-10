import Home, {StateProps, DispatchProps} from './Home';
import {connect} from 'react-redux';
import {AppState} from '../../store';
import asyncIncrement from '../../saga/asyncIncrement/action';
import bootstrap from '../../saga/bootstrap/action';
import user from '../../store/user';

const mapStateToProps = (state: AppState): StateProps => {
	return {
		count: state.counter.count,
		user: state.user,
		items: state.inventory.items,
	};
};

const mapDispatchToProps = {
	asyncIncrement,
	loadUser: user.actions.fetchRequest,
	bootstrap,
};

export default connect<StateProps, DispatchProps, null, AppState>(
	mapStateToProps,
	mapDispatchToProps
)(Home);
