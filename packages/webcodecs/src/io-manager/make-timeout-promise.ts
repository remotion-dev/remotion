import {withResolvers} from '../create/with-resolvers';

export const makeTimeoutPromise = (label: () => string, ms: number) => {
	const {promise, reject, resolve} = withResolvers<void>();

	const timeout = setTimeout(() => {
		reject(new Error(`${label()} (timed out after ${ms}ms)`));
	}, ms);

	return {
		timeoutPromise: promise,
		clear: () => {
			clearTimeout(timeout);
			resolve();
		},
	};
};
