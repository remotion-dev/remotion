/**
 * @vitest-environment jsdom
 */
import {describe, expect, test} from 'vitest';
import {continueRender, delayRender} from '../delay-render';

describe('Ready Manager tests', () => {
	let handle: number;

	test('delayRender sets window.ready to false', () => {
		window.ready = true;
		handle = delayRender();
		expect(typeof handle).toBe('number');
		expect(window.ready).toBe(false);
	});

	test('continueRender sets window.ready to true', () => {
		continueRender(handle);
		expect(window.ready).toBe(true);
	});

	test('Render is only continued if all handles have been finished', () => {
		handle = delayRender();
		const handle2 = delayRender();
		expect(window.ready).toBe(false);
		continueRender(handle);
		expect(window.ready).toBe(false);
		continueRender(handle2);
		expect(window.ready).toBe(true);
	});
});
