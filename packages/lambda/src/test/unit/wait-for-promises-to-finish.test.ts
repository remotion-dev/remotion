import {expect, test} from 'bun:test';
import {waitForPromisesToFinish} from '../../shared/wait-for-promises-to-finish';

test('waits for all promises before rethrowing the first error', async () => {
	const firstError = new Error('First promise failed');
	let resolvePending: () => void = () => undefined;
	let pendingFinished = false;
	const pendingPromise = new Promise<void>((resolve) => {
		resolvePending = resolve;
	}).then(() => {
		pendingFinished = true;
	});

	let waitFinished = false;
	const resultPromise = waitForPromisesToFinish([
		Promise.reject(firstError),
		pendingPromise,
	]).then(
		() => {
			waitFinished = true;
			return null;
		},
		(error: unknown) => {
			waitFinished = true;
			return error;
		},
	);

	await Promise.resolve();
	await Promise.resolve();
	expect(waitFinished).toBe(false);
	expect(pendingFinished).toBe(false);

	resolvePending();
	expect(await resultPromise).toBe(firstError);
	expect(pendingFinished).toBe(true);
});
