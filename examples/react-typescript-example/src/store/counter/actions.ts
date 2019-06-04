import {IncreaseAction, INCREASE} from './types';

export const increaseCount = (): IncreaseAction => ({
	type: INCREASE,
});
