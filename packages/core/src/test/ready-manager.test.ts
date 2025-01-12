import {describe, expect, test} from 'bun:test';
import {continueRender, delayRender} from '../delay-render.js';

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
});
