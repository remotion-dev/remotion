export type MediaParserController = {
	signal: AbortSignal;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	abort: (reason?: any) => void;
};

export const mediaParserController = (): MediaParserController => {
	const abortController = new AbortController();
	return {
		signal: abortController.signal,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		abort: (reason?: any) => {
			abortController.abort(reason);
		},
	};
};
