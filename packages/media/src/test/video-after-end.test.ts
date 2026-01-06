import {assert, expect, test} from 'vitest';
import {getMaxVideoCacheSize, keyframeManager} from '../caches';
import {extractFrame} from '../video-extraction/extract-frame';

test('Should render last frame for timestamps after video end', async () => {
	keyframeManager.clearAll('info');

	const result = await extractFrame({
		src: '/video.mp4',
		timeInSeconds: 12.041666666666666, // 194 frames at 24fps = 8.08 seconds
		logLevel: 'info',
		loop: false,
		trimAfter: undefined,
		trimBefore: undefined,
		playbackRate: 1,
		fps: 24,
		maxCacheSize: getMaxVideoCacheSize('info'),
	});

	assert(result.type === 'success');
	expect(result.sample?.timestamp).toBe(9.96);

	keyframeManager.clearAll('info');
});
