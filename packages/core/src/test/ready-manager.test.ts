import {describe, expect, test} from 'bun:test';
import type {DelayRenderScope} from '../delay-render.js';
import {
	continueRender,
	continueRenderInternal,
	delayRender,
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
});
