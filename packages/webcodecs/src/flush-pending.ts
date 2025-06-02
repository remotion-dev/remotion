import {withResolvers} from './create/with-resolvers';

export type FlushPending = {
	resolve: (value: void | PromiseLike<void>) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	reject: (reason?: any) => void;
	promise: Promise<void>;
};

export const makeFlushPending = () => {
	const {promise, resolve, reject} = withResolvers<void>();

	return {
		promise,
		resolve,
		reject,
	};
};
