/* eslint-disable prefer-promise-reject-errors */
export type CancellablePromise = {
	promise: Promise<unknown>;
	cancel: () => void;
};
export const cancellablePromise = (
	promise: Promise<unknown>,
): CancellablePromise => {
	let isCanceled = false;

	const wrappedPromise = new Promise((resolve, reject) => {
		promise
			.then((value) => {
				if (isCanceled) {
					reject({isCanceled, value});
					return;
				}

				resolve(value);
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
