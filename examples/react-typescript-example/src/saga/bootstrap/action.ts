import {Action} from 'redux';

export const BOOTSTRAP = 'BOOTSTRAP';

export interface BootStrapAction extends Action {}

export default (): BootStrapAction => ({
	type: BOOTSTRAP,
});
