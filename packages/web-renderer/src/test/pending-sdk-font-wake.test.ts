import {expect, test} from 'vitest';
import {observePendingFont, type PendingFontWake} from '../pending-font-wake';

const controlledLoad = () => {
	let resolve!: () => void;
	let reject!: (error: unknown) => void;
	const promise = new Promise<void>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return {promise, resolve, reject};
};

test('SDK rejection wakes the consumer with original error after pending metadata disappears', async () => {
	const load = controlledLoad();
	const error = new Error('SDK pipeline failure');
	let calls = 0;
	const token: PendingFontWake = {
		check: () => {
			calls++;
		},
		failure: null,
	};
	observePendingFont(load.promise, token);
	load.reject(error);
	await Promise.resolve();
	expect(calls).toBe(1);
	expect(token.failure?.error).toBe(error);
	token.check = null;
	token.failure = null;
});

test('detaching an aborted consumer prevents a late SDK rejection retaining its error', async () => {
	const load = controlledLoad();
	let calls = 0;
	const token: PendingFontWake = {
		check: () => {
			calls++;
		},
		failure: null,
	};
	observePendingFont(load.promise, token);
	// This is the cleanup operation performed by the waiter's abort path.
	token.check = null;
	token.failure = null;
	load.reject(new Error('Late SDK failure'));
	await Promise.resolve();
	expect(calls).toBe(0);
	expect(token.failure).toBe(null);
	expect(token.check).toBe(null);
});

test('concurrent wait consumers settle independently from the same SDK operation', async () => {
	const load = controlledLoad();
	let firstCalls = 0;
	let secondCalls = 0;
	const first: PendingFontWake = {
		check: () => {
			firstCalls++;
		},
		failure: null,
	};
	const second: PendingFontWake = {
		check: () => {
			secondCalls++;
		},
		failure: null,
	};
	observePendingFont(load.promise, first);
	observePendingFont(load.promise, second);
	first.check = null;
	load.resolve();
	await Promise.resolve();
	expect(firstCalls).toBe(0);
	expect(secondCalls).toBe(1);
	expect(second.failure).toBe(null);
	second.check = null;
});
