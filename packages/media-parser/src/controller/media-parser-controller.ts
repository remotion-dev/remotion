import {MediaParserAbortError} from '../errors';
import type {SeekingHints} from '../seeking-hints';
import {MediaParserEmitter} from './emitter';
import type {PauseSignal} from './pause-signal';
import {makePauseSignal} from './pause-signal';
import type {PerformedSeeksSignal} from './performed-seeks-stats';
import {performedSeeksStats} from './performed-seeks-stats';
import type {SeekSignal} from './seek-signal';
import {makeSeekSignal} from './seek-signal';

export type MediaParserController = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	abort: (reason?: any) => void;
	pause: PauseSignal['pause'];
	resume: PauseSignal['resume'];
	_experimentalSeek: SeekSignal['seek'];
	addEventListener: MediaParserEmitter['addEventListener'];
	removeEventListener: MediaParserEmitter['removeEventListener'];
	getSeekingHints: () => Promise<SeekingHints | null>;
	/**
	 * @deprecated Not public API
	 */
	_internals: {
		signal: AbortSignal;
		checkForAbortAndPause: () => Promise<void>;
		seekSignal: SeekSignal;
		markAsReadyToEmitEvents: () => void;
		performedSeeksSignal: PerformedSeeksSignal;
		attachSeekingHintResolution: (
			callback: () => Promise<SeekingHints | null>,
		) => void;
	};
};

export const mediaParserController = (): MediaParserController => {
	const abortController = new AbortController();
	const emitter = new MediaParserEmitter();
	const pauseSignal = makePauseSignal(emitter);
	const seekSignal = makeSeekSignal(emitter);
	const performedSeeksSignal = performedSeeksStats();

	const checkForAbortAndPause = async () => {
		if (abortController.signal.aborted) {
			throw new MediaParserAbortError('Aborted');
		}

		await pauseSignal.waitUntilResume();
	};

	let seekingHintResolution: (() => Promise<SeekingHints | null>) | null = null;

	const getSeekingHints = () => {
		if (!seekingHintResolution) {
			throw new Error(
				'The mediaParserController() was not yet used in a parseMedia() call',
			);
		}

		return seekingHintResolution();
	};

	const attachSeekingHintResolution = (
		callback: () => Promise<SeekingHints | null>,
	) => {
		if (seekingHintResolution) {
			throw new Error(
				'The mediaParserController() was used in multiple parseMedia() calls. Create a separate controller for each call.',
			);
		}

		seekingHintResolution = callback;
	};

	return {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		abort: (reason?: any) => {
			abortController.abort(reason);
			emitter.dispatchAbort(reason);
		},
		_experimentalSeek: seekSignal.seek,
		pause: pauseSignal.pause,
		resume: pauseSignal.resume,
		addEventListener: emitter.addEventListener,
		removeEventListener: emitter.removeEventListener,
		getSeekingHints,
		_internals: {
			signal: abortController.signal,
			checkForAbortAndPause,
			seekSignal,
			markAsReadyToEmitEvents: emitter.markAsReady,
			performedSeeksSignal,
			attachSeekingHintResolution,
		},
	};
};
