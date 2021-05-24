/* eslint-disable prefer-promise-reject-errors */
export type CancellablePromise = {
	promise: Promise<unknown>;
	cancel: () => void;
};
export const cancellablePromise = (
	promise: Promise<unknown>
): CancellablePromise => {
	let isCanceled = false;

	const wrappedPromise = new Promise((resolve, reject) => {
		promise
			.then((value) => {
				// eslint-disable-next-line no-unused-expressions
				isCanceled ? reject({isCanceled, value}) : resolve(value);
			})
			.catch((error) => {
				reject({isCanceled, error});
			});
	});

	return {
		promise: wrappedPromise,
		cancel: () => {
			isCanceled = true;
		},
	};
};
