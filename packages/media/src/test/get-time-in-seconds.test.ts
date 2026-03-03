import {expect, test} from 'vitest';
import {getTimeInSeconds} from '../get-time-in-seconds';

test('should not return negative time for looping video with trim', () => {
	const result = getTimeInSeconds({
		unloopedTimeInSeconds: 17.047,
		playbackRate: 1,
		loop: true,
		trimBefore: 640,
		trimAfter: 1800,
		mediaDurationInSeconds: 596.4741950113379,
		fps: 24,
		ifNoMediaDuration: 'fail',
		src: 'https://remotion.media/BigBuckBunny.mp4',
	});

	expect(result).not.toBeNull();
	expect(result).toBeGreaterThanOrEqual(0);
});
