import {Action} from 'redux';

export const ASYNC_INCREMENT = 'ASYNC_INCREMENT';

export interface AsyncIncrementAction extends Action {
    payload: number
}

export default (num: number): AsyncIncrementAction  => ({
    type: ASYNC_INCREMENT,
    payload: num
})