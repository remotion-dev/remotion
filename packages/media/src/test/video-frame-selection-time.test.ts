import {expect, test} from 'vitest';
import {getVideoFrameSelectionTimeInSeconds} from '../get-video-frame-selection-time';

test('selects video from the center of the output frame', () => {
	const fps = 30.00600120624245;
	const time = getVideoFrameSelectionTimeInSeconds({
		loop: false,
		mediaDurationInSeconds: null,
		unloopedTimeInSeconds: 90 / fps,
		durationInSeconds: 1 / fps,
		src: 'test.mp4',
		trimAfter: undefined,
		trimBefore: undefined,
		fps,
		playbackRate: 1,
		ifNoMediaDuration: 'infinity',
	});

	expect(time).toBeGreaterThan(3);
	expect(time).toBeLessThan(3.017);
});

test('falls back to frame start if the center is trimmed away', () => {
	const time = getVideoFrameSelectionTimeInSeconds({
		loop: false,
		mediaDurationInSeconds: null,
		unloopedTimeInSeconds: 0,
		durationInSeconds: 1 / 30,
		src: 'test.mp4',
		trimAfter: 0.25,
		trimBefore: undefined,
		fps: 30,
		playbackRate: 1,
		ifNoMediaDuration: 'infinity',
	});

	expect(time).toBe(0);
});
