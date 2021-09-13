const validOptions = ['tab','browser'] as const;

export type concurrentMode = typeof validOptions[number];

let currentConcurrentMode: concurrentMode = 'tab';

export const setConcurrentMode = (mode: concurrentMode) => {
	if (!validOptions.includes(mode)) {
		throw new TypeError(`Value ${mode} is not valid as a concurrent mode.`);
	}

	currentConcurrentMode = mode;
};

export const getConcurrentMode = () => {
	return currentConcurrentMode;
};
