import type {ParseMediaController} from '@remotion/media-parser';
import {mediaParserController} from '@remotion/media-parser';

export type WebCodecsController = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	abort: (reason?: any) => void;
	pause: ParseMediaController['pause'];
	resume: ParseMediaController['resume'];
	addEventListener: ParseMediaController['addEventListener'];
	removeEventListener: ParseMediaController['removeEventListener'];
	/**
	 * @deprecated Not public API
	 */
	_internals: {
		signal: AbortSignal;
		checkForAbortAndPause: ParseMediaController['_internals']['checkForAbortAndPause'];
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
