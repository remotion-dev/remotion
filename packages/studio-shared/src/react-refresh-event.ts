import {Internals} from 'remotion';

declare global {
	interface Window {
		remotion_performReactRefresh: (() => unknown) | null;
	}
}

export const {REACT_REFRESH_STARTED_EVENT, REACT_REFRESH_FINISHED_EVENT} =
	Internals;
