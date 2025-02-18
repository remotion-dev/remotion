import {MediaParserEmitter} from './emitter';
import {MediaParserAbortError} from './errors';
import type {PauseSignal} from './pause-signal';
import {makePauseSignal} from './pause-signal';

export type MediaParserController = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	abort: (reason?: any) => void;
	pause: PauseSignal['pause'];
	resume: PauseSignal['resume'];
	addEventListener: MediaParserEmitter['addEventListener'];
	removeEventListener: MediaParserEmitter['removeEventListener'];
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
	const emitter = new MediaParserEmitter();
	const pauseSignal = makePauseSignal(emitter);

	const checkForAbortAndPause = async () => {
		if (abortController.signal.aborted) {
			throw new MediaParserAbortError('Aborted');
		}

		await pauseSignal.waitUntilResume();
	};

	return {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		abort: (reason?: any) => {
			abortController.abort(reason);
			emitter.dispatchAbort(reason);
		},
		pause: pauseSignal.pause,
		resume: pauseSignal.resume,
		addEventListener: emitter.addEventListener,
		removeEventListener: emitter.removeEventListener,
		_internals: {
			signal: abortController.signal,
			checkForAbortAndPause,
		},
	};
};
