export type PauseSignal = {
	pause: () => void;
	resume: () => void;
	waitUntilResume: () => Promise<void>;
};

export const makePauseSignal = () => {
	const waiterFns: (() => void)[] = [];

	let paused = false;
	return {
		pause: () => {
			paused = true;
		},
		resume: () => {
			paused = false;
			for (const waiterFn of waiterFns) {
				waiterFn();
			}

			waiterFns.length = 0;
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
