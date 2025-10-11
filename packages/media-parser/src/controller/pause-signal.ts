import type {MediaParserEmitter} from './emitter';

export type PauseSignal = {
	pause: () => void;
	resume: () => void;
	waitUntilResume: () => Promise<void>;
};

export const makePauseSignal = (emitter: MediaParserEmitter) => {
	const waiterFns: (() => void)[] = [];

	let paused = false;
	return {
		pause: () => {
			if (paused) {
				return;
			}

			emitter.dispatchPause();
			paused = true;
		},
		resume: () => {
			if (!paused) {
				return;
			}

			paused = false;
			for (const waiterFn of waiterFns) {
				waiterFn();
			}

			waiterFns.length = 0;
			emitter.dispatchResume();
		},
		waitUntilResume: () => {
			return new Promise<void>((resolve) => {
				if (!paused) {
					resolve();
				} else {
					waiterFns.push(resolve);
				}
			});
		},
	};
};
