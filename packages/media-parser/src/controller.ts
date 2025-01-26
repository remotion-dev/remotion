export type ParseMediaController = {
	signal: AbortSignal;
	abort: () => void;
};

export const createController = () => {
	const abortController = new AbortController();
	return {
		signal: abortController.signal,
		abort: () => {
			abortController.abort();
		},
	};
};
