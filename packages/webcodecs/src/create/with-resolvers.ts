interface WebCodecsPromiseWithResolvers<T> {
	promise: Promise<T>;
	resolve: (value: T | PromiseLike<T>) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	reject: (reason?: any) => void;
}

export const withResolvers = function <T>() {
	let resolve: WebCodecsPromiseWithResolvers<T>['resolve'];
	let reject: WebCodecsPromiseWithResolvers<T>['reject'];
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return {promise, resolve: resolve!, reject: reject!};
};

export const withResolversAndWaitForReturn = <T>() => {
	const {promise, reject, resolve} = withResolvers<T>();
	const {promise: returnPromise, resolve: resolveReturn} =
		withResolvers<void>();

	return {
		getPromiseToImmediatelyReturn: () => {
			resolveReturn(undefined);
			return promise;
		},
		reject: (reason: unknown) => {
			returnPromise.then(() => reject(reason));
		},
		resolve,
	};
};
