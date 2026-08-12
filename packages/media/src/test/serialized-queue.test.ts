import {expect, test} from 'vitest';
import {makeSerializedQueue} from '../serialized-queue';

test('a rejection does not poison later work on the same queue', async () => {
	const enqueue = makeSerializedQueue();

	const failed = enqueue(() => Promise.reject(new Error('cannot decode')));
	await expect(failed).rejects.toThrow('cannot decode');

	let ran = false;
	const after = enqueue(() => {
		ran = true;
		return Promise.resolve('ok');
	});

	await expect(after).resolves.toBe('ok');
	expect(ran).toBe(true);
});

test('a later failure reports its own error, not an earlier one', async () => {
	const enqueue = makeSerializedQueue();

	await expect(
		enqueue(() => Promise.reject(new Error('first file'))),
	).rejects.toThrow('first file');

	await expect(
		enqueue(() => Promise.reject(new Error('second file'))),
	).rejects.toThrow('second file');
});

test('work stays serialized, in call order', async () => {
	const enqueue = makeSerializedQueue();
	const order: string[] = [];

	const slow = enqueue(async () => {
		await new Promise((resolve) => {
			setTimeout(resolve, 20);
		});
		order.push('first');
	});
	const fast = enqueue(() => {
		order.push('second');
		return Promise.resolve();
	});

	await Promise.all([slow, fast]);

	expect(order).toEqual(['first', 'second']);
});

test('serialization survives a rejection in the middle', async () => {
	const enqueue = makeSerializedQueue();
	const order: string[] = [];

	const first = enqueue(async () => {
		await new Promise((resolve) => {
			setTimeout(resolve, 20);
		});
		order.push('first');
	});
	const boom = enqueue(() => {
		order.push('boom');
		return Promise.reject(new Error('boom'));
	});
	const last = enqueue(() => {
		order.push('last');
		return Promise.resolve();
	});

	await first;
	await expect(boom).rejects.toThrow('boom');
	await last;

	expect(order).toEqual(['first', 'boom', 'last']);
});

test('a caller that never attaches a handler does not break the queue', async () => {
	const enqueue = makeSerializedQueue();

	// Deliberately not awaited: mirrors a call site that fires and forgets.
	enqueue(() => Promise.reject(new Error('ignored')));

	await expect(enqueue(() => Promise.resolve('still works'))).resolves.toBe(
		'still works',
	);
});
