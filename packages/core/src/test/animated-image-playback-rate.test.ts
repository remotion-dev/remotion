import {expect, test} from 'bun:test';
import {getCurrentTime} from '../animated-image/get-current-time.js';

test('calculates the current time using the playback rate', () => {
	expect(getCurrentTime({frame: 30, playbackRate: 1, fps: 30})).toBe(1);
	expect(getCurrentTime({frame: 30, playbackRate: 2, fps: 30})).toBe(2);
	expect(getCurrentTime({frame: 30, playbackRate: 0.5, fps: 30})).toBe(0.5);
});
