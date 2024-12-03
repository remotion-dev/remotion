import {MediaParserInternals} from '@remotion/media-parser';

export const makeTimeoutPromise = (label: string, ms: number) => {
	const {promise, reject, resolve} = MediaParserInternals.withResolvers<void>();

	const timeout = setTimeout(() => {
		reject(new Error(`${label} (timed out after ${ms}ms)`));
	}, ms);

	return {
		timeoutPromise: promise,
		clear: () => {
			clearTimeout(timeout);
			resolve();
		},
	};
};
