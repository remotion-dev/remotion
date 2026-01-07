import {assert, expect, test} from 'vitest';
import {getMaxVideoCacheSize, keyframeManager} from '../caches';
import {extractFrame} from '../video-extraction/extract-frame';

test('Should render first frame for videos starting after timestamp 0', async () => {
	await keyframeManager.clearAll('info');

	// This video's first video frame is at 0.15 seconds (150ms)
	// Requesting frame at 0sec should clamp to first available frame (0.15s)
	// Previously would throw: "Timestamp is before start timestamp (requested: 0sec, start: 0.15sec, difference: 0.150sec exceeds tolerance of 0.1sec)"
	// Now matches Chrome's behavior: render the first frame rather than showing black
	const result = await extractFrame({
		src: '/video-start-offset.mp4',
		timeInSeconds: 0,
		logLevel: 'info',
		loop: false,
		trimAfter: undefined,
		trimBefore: undefined,
		playbackRate: 1,
		fps: 30,
		maxCacheSize: getMaxVideoCacheSize('info'),
	});

	// Should successfully extract (no error thrown)
	expect(result.type).toBe('success');
	assert(result.type === 'success');
	assert(result.sample, 'Frame should be returned');

	// Frame should have valid dimensions
	expect(result.sample.codedWidth).toBe(640);
	expect(result.sample.codedHeight).toBe(480);

	// Frame timestamp should be at video start (0.15s), NOT at requested time (0s)
	// This proves we're returning the first actual frame
	expect(result.sample.timestamp).toBeCloseTo(0.15, 2);

	// Verify frame has pixel data (not completely black)
	// testsrc generates a test pattern with colors and gradients
	const bufferSize = result.sample.codedWidth * result.sample.codedHeight * 4;
	const buffer = new Uint8Array(bufferSize);
	await result.sample.copyTo(buffer);
	const hasNonZeroPixels = buffer.some((byte) => byte > 0);
	expect(hasNonZeroPixels).toBe(true);

	await keyframeManager.clearAll('info');
});
