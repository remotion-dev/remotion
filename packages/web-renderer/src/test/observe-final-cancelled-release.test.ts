import type {DelayRenderScope} from 'remotion';
import {expect, test} from 'vitest';
import {observeFinalCancelledRelease} from './observe-final-cancelled-release';

const createScope = (): DelayRenderScope => ({
	remotion_renderReady: false,
	remotion_delayRenderHandles: [1, 2],
	remotion_delayRenderTimeouts: {},
	remotion_puppeteerTimeout: 30000,
	remotion_attempt: 1,
});

test('captures the original fatal stack before React-style decoration without changing cancellation', () => {
	const scope = createScope();
	const failure = new Error('fatal context');
	failure.stack = 'effect@fixture.js:1:1';
	scope.remotion_cancelledErrorObject = failure;
	scope.remotion_cancelledError = 'fatal context\neffect@fixture.js:1:1';
	const captures: {error: Error; rawStack: string}[] = [];
	const restore = observeFinalCancelledRelease(scope, (error, rawStack) => {
		captures.push({error, rawStack});
	});
	try {
		scope.remotion_delayRenderHandles = [2];
		expect(captures).toEqual([]);
		scope.remotion_delayRenderHandles = [];
		expect(captures).toEqual([
			{error: failure, rawStack: 'effect@fixture.js:1:1'},
		]);
		failure.stack += '\nReact component stack: CanvasImage';
		expect(scope.remotion_cancelledErrorObject).toBe(failure);
		expect(scope.remotion_cancelledError).toBe(
			'fatal context\neffect@fixture.js:1:1',
		);
		expect(captures[0].rawStack).toBe('effect@fixture.js:1:1');
		expect(captures[0].rawStack).not.toBe(failure.stack);
		scope.remotion_delayRenderHandles = [];
		expect(captures).toHaveLength(1);
	} finally {
		restore();
	}
	expect(
		Object.getOwnPropertyDescriptor(scope, 'remotion_delayRenderHandles'),
	).toEqual({
		value: [],
		writable: true,
		enumerable: true,
		configurable: true,
	});
});

test('successful releases remain unobserved and restore the exact final hold state', () => {
	const scope = createScope();
	const captures: Error[] = [];
	const restore = observeFinalCancelledRelease(scope, (error) =>
		captures.push(error),
	);
	const remaining = [2];
	scope.remotion_delayRenderHandles = remaining;
	restore();
	expect(captures).toEqual([]);
	expect(scope.remotion_delayRenderHandles).toBe(remaining);
	expect(
		Object.getOwnPropertyDescriptor(scope, 'remotion_delayRenderHandles'),
	).toEqual({
		value: remaining,
		writable: true,
		enumerable: true,
		configurable: true,
	});
});

test('restoring an untouched scope preserves its original property descriptor', () => {
	const scope = createScope();
	const before = Object.getOwnPropertyDescriptor(
		scope,
		'remotion_delayRenderHandles',
	);
	const restore = observeFinalCancelledRelease(scope, () => {
		throw new Error('Unexpected release');
	});
	restore();
	expect(
		Object.getOwnPropertyDescriptor(scope, 'remotion_delayRenderHandles'),
	).toEqual(before);
});
