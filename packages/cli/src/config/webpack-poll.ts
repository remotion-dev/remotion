const DEFAULT_WEBPACK_POLL = null;

let webpackPolling: number | null = DEFAULT_WEBPACK_POLL;

export const setWebpackPollingInMilliseconds = (interval: number | null) => {
	if (typeof interval !== 'number' && interval !== null) {
		throw new TypeError(
			`Polling must be a number or null, got ${JSON.stringify(
				interval,
			)} instead.`,
		);
	}

	webpackPolling = interval;
};

export const getWebpackPolling = () => {
	return webpackPolling;
};
