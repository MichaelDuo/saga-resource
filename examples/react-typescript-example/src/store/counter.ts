import {makeResource} from 'saga-resource';

const counter = makeResource({
    name: 'counter',
    state: {
        count: 0
    }
})

export default counter