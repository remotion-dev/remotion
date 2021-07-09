import {continueRender, delayRender} from '../ready-manager';

describe('Ready Manager tests', () => {
	let handle: number;

	test('delayRender sets window.remotion_handlesReady to false', () => {
		window.remotion_handlesReady = true;
		handle = delayRender();
		expect(typeof handle).toBe('number');
		expect(window.remotion_handlesReady).toBe(false);
	});

	test('continueRender sets window.remotion_handlesReady to true', () => {
		continueRender(handle);
		expect(window.remotion_handlesReady).toBe(true);
	});

	test('Render is only continued if all handles have been finished', () => {
		handle = delayRender();
		const handle2 = delayRender();
		expect(window.remotion_handlesReady).toBe(false);
		continueRender(handle);
		expect(window.remotion_handlesReady).toBe(false);
		continueRender(handle2);
		expect(window.remotion_handlesReady).toBe(true);
	});
});
