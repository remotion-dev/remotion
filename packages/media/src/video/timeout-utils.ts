/* eslint-disable no-promise-executor-return */
export const sleep = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

export class TimeoutError extends Error {
	constructor(message: string = 'Operation timed out') {
		super(message);
		this.name = 'TimeoutError';
	}
}

export function withTimeout<T>(
	promise: Promise<T>,
	timeoutMs: number,
	errorMessage: string = 'Operation timed out',
): Promise<T> {
	let timeoutId: number | null = null;

	const timeoutPromise = new Promise<never>((_, reject) => {
		timeoutId = window.setTimeout(() => {
			reject(new TimeoutError(errorMessage));
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
