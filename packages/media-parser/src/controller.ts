import type {PauseSignal} from './pause-signal';
import {makePauseSignal} from './pause-signal';

export type MediaParserController = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	abort: (reason?: any) => void;
	pause: PauseSignal['pause'];
	resume: PauseSignal['resume'];
	/**
	 * @deprecated Not public API
	 */
	_internals: {
		signal: AbortSignal;
		waitUntilResume: PauseSignal['waitUntilResume'];
	};
};

export const mediaParserController = (): MediaParserController => {
	const abortController = new AbortController();
	const pauseSignal = makePauseSignal();

	return {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		abort: (reason?: any) => {
			abortController.abort(reason);
		},
		pause: pauseSignal.pause,
		resume: pauseSignal.resume,
		_internals: {
			signal: abortController.signal,
			waitUntilResume: pauseSignal.waitUntilResume,
		},
	};
};
