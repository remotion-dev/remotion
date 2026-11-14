import {expect, test, vi} from 'vitest';
import {awaitSvgDrawable} from '../drawing/await-svg-drawable';

test('retains the original drawable without a capture signal', () => {
	const operation = Promise.resolve('image');
	expect(awaitSvgDrawable(operation, null)).toBe(operation);
});

test('rejects an already cancelled capture and handles a later shared failure', async () => {
	const controller = new AbortController();
	controller.abort();
	let fail!: (error: Error) => void;
	const operation = new Promise<string>((_, reject) => {
		fail = reject;
	});
	await expect(awaitSvgDrawable(operation, controller.signal)).rejects.toThrow(
		'cancelled',
	);
	fail(new Error('late shared failure'));
	await Promise.resolve();
});

test('cancels one waiter while retaining a shared drawable for another', async () => {
	const cancelled = new AbortController();
	const active = new AbortController();
	let complete!: (value: string) => void;
	const operation = new Promise<string>((resolve) => {
		complete = resolve;
	});
	const abandoned = awaitSvgDrawable(operation, cancelled.signal);
	const retained = awaitSvgDrawable(operation, active.signal);
	const failure = abandoned.catch((error: Error) => error);
	cancelled.abort();
	expect(await failure).toBeInstanceOf(Error);
	expect(((await failure) as Error).message).toContain('cancelled');
	complete('shared image');
	await expect(retained).resolves.toBe('shared image');
	await expect(operation).resolves.toBe('shared image');
});

test('releases the abort listener after drawable resolution', async () => {
	const controller = new AbortController();
	const remove = vi.spyOn(controller.signal, 'removeEventListener');
	await expect(
		awaitSvgDrawable(Promise.resolve('image'), controller.signal),
	).resolves.toBe('image');
	expect(remove).toHaveBeenCalledTimes(1);
});

test('preserves a drawable error and releases its abort listener', async () => {
	const controller = new AbortController();
	const remove = vi.spyOn(controller.signal, 'removeEventListener');
	const error = new Error('font fetch failed');
	await expect(
		awaitSvgDrawable(Promise.reject(error), controller.signal),
	).rejects.toBe(error);
	expect(remove).toHaveBeenCalledTimes(1);
});
