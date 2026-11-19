import {describe, expect, test} from 'bun:test';
import type {DelayRenderScope} from '../delay-render.js';
import {
	continueRender,
	continueRenderInternal,
	delayRender,
	delayRenderInternal,
	getDelayRenderSuspendedTime,
	suspendDelayRenderTimeout,
} from '../delay-render.js';

describe('Ready Manager tests', () => {
	let handle: number;

	test('delayRender sets window.remotion_renderReady to false', () => {
		window.remotion_renderReady = true;
		handle = delayRender();
		expect(typeof handle).toBe('number');
		expect(window.remotion_renderReady).toBe(false);
	});

	test('continueRender sets window.remotion_renderReady to true', () => {
		continueRender(handle);
		expect(window.remotion_renderReady).toBe(true);
	});

	test('Render is only continued if all handles have been finished', () => {
		handle = delayRender();
		const handle2 = delayRender();
		expect(window.remotion_renderReady).toBe(false);
		continueRender(handle);
		expect(window.remotion_renderReady).toBe(false);
		continueRender(handle2);
		expect(window.remotion_renderReady).toBe(true);
	});

	test('Does not clear a timeout if the handle does not exist', () => {
		const unknownHandle = 1;
		const timeout = setTimeout(() => undefined, 10_000);
		const scope: DelayRenderScope = {
			remotion_attempt: 1,
			remotion_delayRenderHandles: [],
			remotion_delayRenderTimeouts: {
				[unknownHandle]: {
					label: null,
					startTime: Date.now(),
					timeout,
				},
			},
			remotion_puppeteerTimeout: 30_000,
			remotion_renderReady: false,
		};

		continueRenderInternal({
			environment: {
				isClientSideRendering: false,
				isPlayer: false,
				isReadOnlyStudio: false,
				isRendering: true,
				isStudio: false,
			},
			handle: unknownHandle,
			logLevel: 'info',
			scope,
		});

		expect(scope.remotion_delayRenderTimeouts[unknownHandle]).toBeDefined();
		clearTimeout(timeout);
	});

	test('delayRender timeout cannot be negative', async () => {
		const scope: DelayRenderScope = {
			remotion_attempt: 1,
			remotion_delayRenderHandles: [],
			remotion_delayRenderTimeouts: {},
			remotion_puppeteerTimeout: 30_000,
			remotion_renderReady: true,
		};

		delayRenderInternal({
			environment: {
				isClientSideRendering: true,
				isPlayer: false,
				isReadOnlyStudio: false,
				isRendering: true,
				isStudio: false,
			},
			label: 'Loading data',
			options: {
				timeoutInMilliseconds: 1000,
			},
			scope,
		});

		await new Promise((resolve) => setTimeout(resolve, 10));

		expect(scope.remotion_cancelledError).toContain(
			'was called but not cleared after 0ms',
		);
	});
});

// Regression coverage for PR #12021: suspension belongs to a render scope,
// nests, and must not recreate a timeout after the handle is cleared.
test('nested timeout suspension leaves other render scopes running', async () => {
	const environment = {
		isClientSideRendering: true,
		isPlayer: false,
		isReadOnlyStudio: false,
		isRendering: true,
		isStudio: false,
	};
	const scope: DelayRenderScope = {
		remotion_attempt: 1,
		remotion_delayRenderHandles: [],
		remotion_delayRenderTimeouts: {},
		remotion_puppeteerTimeout: 2200,
		remotion_renderReady: true,
	};
	const other: DelayRenderScope = {
		...scope,
		remotion_delayRenderHandles: [],
		remotion_delayRenderTimeouts: {},
	};
	const handle = delayRenderInternal({
		scope,
		environment,
		label: null,
		options: {},
	});
	const otherHandle = delayRenderInternal({
		scope: other,
		environment,
		label: null,
		options: {},
	});
	const resume = suspendDelayRenderTimeout(scope, handle);
	const resumeNested = suspendDelayRenderTimeout(scope, handle);
	try {
		resume();
		await new Promise((resolve) => setTimeout(resolve, 300));
		expect(scope.remotion_cancelledError).toBeUndefined();
		expect(other.remotion_cancelledError).toContain('after 200ms');
		expect(getDelayRenderSuspendedTime(scope)).toBeGreaterThanOrEqual(200);
		expect(getDelayRenderSuspendedTime(other)).toBe(0);
		resumeNested();
		await new Promise((resolve) => setTimeout(resolve, 300));
		expect(scope.remotion_cancelledError).toContain('after 200ms');
	} finally {
		continueRenderInternal({scope, handle, environment, logLevel: 'error'});
		continueRenderInternal({
			scope: other,
			handle: otherHandle,
			environment,
			logLevel: 'error',
		});
	}
});

test('clearing a suspended handle prevents its resume from reviving the timeout', async () => {
	const environment = {
		isClientSideRendering: true,
		isPlayer: false,
		isReadOnlyStudio: false,
		isRendering: true,
		isStudio: false,
	};
	const scope: DelayRenderScope = {
		remotion_attempt: 1,
		remotion_delayRenderHandles: [],
		remotion_delayRenderTimeouts: {},
		remotion_puppeteerTimeout: 2000,
		remotion_renderReady: true,
	};
	const handle = delayRenderInternal({
		scope,
		environment,
		label: null,
		options: {},
	});
	const resume = suspendDelayRenderTimeout(scope, handle);
	continueRenderInternal({scope, handle, environment, logLevel: 'error'});
	const elapsed = getDelayRenderSuspendedTime(scope);
	resume();
	resume();
	await new Promise((resolve) => setTimeout(resolve, 20));
	expect(scope.remotion_renderReady).toBe(true);
	expect(scope.remotion_cancelledError).toBeUndefined();
	expect(scope.remotion_delayRenderTimeouts[handle]).toBeUndefined();
	expect(getDelayRenderSuspendedTime(scope)).toBe(elapsed);
});
