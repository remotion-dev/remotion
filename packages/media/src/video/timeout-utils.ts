/* eslint-disable no-promise-executor-return */
export const sleep = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

export function withTimeout<T>(
	promise: Promise<T>,
	timeoutMs: number,
	errorMessage: string = 'Operation timed out',
): Promise<T> {
	let timeoutId: number | null = null;

	const timeoutPromise = new Promise<never>((_, reject) => {
		timeoutId = window.setTimeout(() => {
			reject(new Error(errorMessage));
		}, timeoutMs);
	});

	return Promise.race([
		promise.finally(() => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		}),
		timeoutPromise,
	]);
}
