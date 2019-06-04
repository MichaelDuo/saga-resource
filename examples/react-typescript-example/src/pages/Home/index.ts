import Home, {StateProps, DispatchProps} from './Home';
import {connect} from 'react-redux'
import {AppState} from '../../store'
import asyncIncrement from '../../saga/asyncIncrement/action'

const mapStateToProps = (state: AppState):StateProps => {
    return {
        count: state.counter.count
    }
}

const mapDispatchToProps = {
    asyncIncrement
}

export default connect<StateProps, DispatchProps, null, AppState>(mapStateToProps, mapDispatchToProps)(Home);