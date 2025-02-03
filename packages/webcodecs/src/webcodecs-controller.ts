import type {MediaParserController} from '@remotion/media-parser';
import {mediaParserController} from '@remotion/media-parser';

export type WebCodecsController = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	abort: (reason?: any) => void;
	pause: MediaParserController['pause'];
	resume: MediaParserController['resume'];
	addEventListener: MediaParserController['addEventListener'];
	removeEventListener: MediaParserController['removeEventListener'];
	/**
	 * @deprecated Not public API
	 */
	_internals: {
		signal: AbortSignal;
		checkForAbortAndPause: MediaParserController['_internals']['checkForAbortAndPause'];
	};
};

export const webcodecsController = (): WebCodecsController => {
	const controller = mediaParserController();

	return {
		abort: controller.abort,
		pause: controller.pause,
		resume: controller.resume,
		addEventListener: controller.addEventListener,
		removeEventListener: controller.removeEventListener,
		_internals: controller._internals,
	};
};
