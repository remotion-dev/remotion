import {expect, test, vi} from 'vitest';
import {runWithRenderQueue} from '../render-operations-queue';

const deferred = <T>() => {
	let resolve!: (value: T) => void;
	let reject!: (error: Error) => void;
	const promise = new Promise<T>((resolvePromise, rejectPromise) => {
		resolve = resolvePromise;
		reject = rejectPromise;
	});

	return {promise, resolve, reject};
};

const cancellation = () => new Error('queued render was cancelled');

test('aborting a waiting caller rejects before its predecessor completes without starting a successor', async () => {
	const head = deferred<void>();
	const queue = {ref: head.promise};
	const controller = new AbortController();
	const error = cancellation();
	const calls: string[] = [];
	let observed: unknown = null;
	const aborted = runWithRenderQueue({
		queue,
		signal: controller.signal,
		createCancellationError: () => error,
		render: () => {
			calls.push('aborted');
			return Promise.resolve('incorrect');
		},
	});

	const rejection = aborted.catch((reason: unknown) => {
		observed = reason;
	});

	const successor = runWithRenderQueue({
		queue,
		signal: null,
		createCancellationError: cancellation,
		render: () => {
			calls.push('successor');
			return Promise.resolve('healthy');
		},
	});

	try {
		controller.abort();
		await Promise.resolve();
		expect(observed).toBe(error);
		expect(calls).toEqual([]);
	} finally {
		head.resolve();
		await rejection;
		await successor;
	}

	expect(await successor).toBe('healthy');
	expect(calls).toEqual(['successor']);
});

test('already-aborted calls do not occupy or replace the queue tail', async () => {
	const head = deferred<void>();
	const queue = {ref: head.promise};
	const controller = new AbortController();
	controller.abort();
	let started = false;
	const result = runWithRenderQueue({
		queue,
		signal: controller.signal,
		createCancellationError: cancellation,
		render: () => {
			started = true;
			return Promise.resolve();
		},
	});

	await expect(result).rejects.toThrow('queued render was cancelled');
	expect(queue.ref).toBe(head.promise);
	expect(started).toBe(false);
	head.resolve();
});

test('active work keeps ownership of its original rejection and does not poison later work', async () => {
	const work = deferred<string>();
	const started = deferred<void>();
	const controller = new AbortController();
	const queue = {ref: Promise.resolve()};
	const error = new Error('active renderer failure', {cause: 'original cause'});
	const active = runWithRenderQueue({
		queue,
		signal: controller.signal,
		createCancellationError: cancellation,
		render: () => {
			started.resolve();
			return work.promise;
		},
	});

	const observed = active.catch((reason: unknown) => reason);
	await started.promise;
	controller.abort();
	work.reject(error);
	expect(await observed).toBe(error);
	const next = runWithRenderQueue({
		queue,
		signal: null,
		createCancellationError: cancellation,
		render: () => Promise.resolve('next'),
	});

	expect(await next).toBe('next');
});

test('a rejected predecessor and a synchronous task failure both leave the queue usable', async () => {
	const queue = {ref: Promise.reject(new Error('previous render failed'))};
	const error = new Error('synchronous initialization failure');
	const failed = runWithRenderQueue({
		queue,
		signal: null,
		createCancellationError: cancellation,
		render: () => {
			throw error;
		},
	});

	await expect(failed).rejects.toBe(error);
	const result = runWithRenderQueue({
		queue,
		signal: null,
		createCancellationError: cancellation,
		render: () => Promise.resolve(42),
	});

	expect(await result).toBe(42);
});

test('independent queues can progress while another queue remains held', async () => {
	const head = deferred<void>();
	const held = runWithRenderQueue({
		queue: {ref: head.promise},
		signal: null,
		createCancellationError: cancellation,
		render: () => Promise.resolve('held'),
	});

	try {
		const other = runWithRenderQueue({
			queue: {ref: Promise.resolve()},
			signal: null,
			createCancellationError: cancellation,
			render: () => Promise.resolve('independent'),
		});

		expect(await other).toBe('independent');
	} finally {
		head.resolve();
		await held;
	}
});

test.each([{abortWaiting: false}, {abortWaiting: true}])(
	'removes the waiting abort listener when abortWaiting=$abortWaiting',
	async ({abortWaiting}) => {
		const head = deferred<void>();
		const controller = new AbortController();
		const add = vi.spyOn(controller.signal, 'addEventListener');
		const remove = vi.spyOn(controller.signal, 'removeEventListener');
		const result = runWithRenderQueue({
			queue: {ref: head.promise},
			signal: controller.signal,
			createCancellationError: cancellation,
			render: () => Promise.resolve('complete'),
		});

		const settled = result.catch(() => 'cancelled');
		try {
			if (abortWaiting) controller.abort();
			head.resolve();
			expect(await settled).toBe(abortWaiting ? 'cancelled' : 'complete');
			expect(add).toHaveBeenCalledTimes(1);
			expect(remove).toHaveBeenCalledWith('abort', add.mock.calls[0][1]);
		} finally {
			head.resolve();
			await settled;
			add.mockRestore();
			remove.mockRestore();
		}
	},
);
