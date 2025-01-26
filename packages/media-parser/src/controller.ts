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
		checkForAbortAndPause: () => Promise<void>;
	};
};

export const mediaParserController = (): MediaParserController => {
	const abortController = new AbortController();
	const pauseSignal = makePauseSignal();

	const checkForAbortAndPause = async () => {
		if (abortController.signal.aborted) {
			throw new Error('Aborted');
		}

		await pauseSignal.waitUntilResume();
	};

	return {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		abort: (reason?: any) => {
			abortController.abort(reason);
		},
		pause: pauseSignal.pause,
		resume: pauseSignal.resume,
		_internals: {
			signal: abortController.signal,
			checkForAbortAndPause,
		},
	};
};
