/// <reference types="react-scripts" />
import {AppState as ReduxAppState} from './store';

declare global {
	type AppState = ReduxAppState;
}
