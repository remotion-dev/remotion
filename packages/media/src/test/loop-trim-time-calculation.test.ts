import {expect, test} from 'vitest';
import {getTimeInSeconds} from '../get-time-in-seconds';

test('should inhibit the same behavior as <Html5Video> - no loop', () => {
	const timestamp = getTimeInSeconds({
		fps: 25,
		loop: false,
		mediaDurationInSeconds: 10,
		playbackRate: 1,
		src: 'https://remotion.media/video.mp4',
		trimAfter: 200,
		trimBefore: 100,
		unloopedTimeInSeconds: 4.04,
	});

	expect(timestamp).toBe(null);
});

test('should inhibit the same loop behavior as <Html5Video> - loop + trim after', () => {
	const timestamp = getTimeInSeconds({
		fps: 25,
		loop: true,
		mediaDurationInSeconds: 10,
		playbackRate: 1,
		src: 'https://remotion.media/video.mp4',
		trimAfter: 200,
		trimBefore: 100,
		unloopedTimeInSeconds: 4.04,
	});

	expect(timestamp).toBe(4.04);
});

test('should inhibit the same loop behavior as <Html5Video> - loop + no trim after', () => {
	const timestamp = getTimeInSeconds({
		fps: 25,
		loop: true,
		mediaDurationInSeconds: 10,
		playbackRate: 1,
		src: 'https://remotion.media/video.mp4',
		trimAfter: undefined,
		trimBefore: 100,
		unloopedTimeInSeconds: 4.04,
	});

	expect(timestamp).toBe(8.04);
});

test('should inhibit the same loop behavior as <Html5Video> - edge case', () => {
	const timestamp = getTimeInSeconds({
		fps: 25,
		loop: false,
		mediaDurationInSeconds: 10,
		playbackRate: 1,
		src: 'https://remotion.media/video.mp4',
		trimAfter: 100,
		trimBefore: 0,
		unloopedTimeInSeconds: 4,
	});

	expect(timestamp).toBe(null);
});
