import React from 'react';

export interface StateProps {
    count: number
}

export interface DispatchProps {
    asyncIncrement: (num: number) => void
}

type Props = StateProps & DispatchProps

const Home: React.FC<Props>  = (props) => {
    return (
        <div>
            <div>
                Current Count: {props.count}
            </div>
            <button onClick={() => props.asyncIncrement(1)}>
                Async increment
            </button>
        </div>
    )
}

export default Home