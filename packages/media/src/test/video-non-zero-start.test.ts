import {assert, expect, test} from 'vitest';
import {getMaxVideoCacheSize, keyframeManager} from '../caches';
import {extractFrame} from '../video-extraction/extract-frame';

test('Video frame extraction at timestamp 0 when video starts at 0.15sec', async () => {
	await keyframeManager.clearAll('info');

	// This video's first video frame is at 0.15 seconds (150ms)
	// The old tolerance was 0.1 seconds (100ms), which would have thrown an error:
	// "Timestamp is before start timestamp (requested: 0sec, start: 0.15sec, difference: 0.150sec exceeds tolerance of 0.1sec)"
	// Now we remove the tolerance check entirely and clamp to the first available frame,
	// matching Chrome's behavior of rendering the first frame rather than showing black.
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

	expect(result.type).toBe('success');
	assert(result.type === 'success');

	assert(result.frame, 'Frame should be returned');

	expect(result.frame.codedWidth).toBe(640);
	expect(result.frame.codedHeight).toBe(480);

	// IMPORTANT: Frame timestamp should be at video start (0.15s), NOT at requested time (0s)
	expect(result.frame.timestamp).toBeCloseTo(0.15, 2);

	await keyframeManager.clearAll('info');
});

test('Video frame extraction at exact start timestamp works', async () => {
	await keyframeManager.clearAll('info');

	const result = await extractFrame({
		src: '/video-start-offset.mp4',
		timeInSeconds: 0.15,
		logLevel: 'info',
		loop: false,
		trimAfter: undefined,
		trimBefore: undefined,
		playbackRate: 1,
		fps: 30,
		maxCacheSize: getMaxVideoCacheSize('info'),
	});

	expect(result.type).toBe('success');
	assert(result.type === 'success');
	assert(result.frame);

	expect(result.frame.timestamp).toBeCloseTo(0.15, 2);

	await keyframeManager.clearAll('info');
});

test('Video frame extraction slightly before start clamps to first frame', async () => {
	await keyframeManager.clearAll('info');

	// Requesting at 0.1 (slightly before 0.15) should clamp to 0.15
	const result = await extractFrame({
		src: '/video-start-offset.mp4',
		timeInSeconds: 0.1,
		logLevel: 'info',
		loop: false,
		trimAfter: undefined,
		trimBefore: undefined,
		playbackRate: 1,
		fps: 30,
		maxCacheSize: getMaxVideoCacheSize('info'),
	});

	expect(result.type).toBe('success');
	assert(result.type === 'success');
	assert(result.frame);

	// Should return first frame at 0.15, not an error
	expect(result.frame.timestamp).toBeCloseTo(0.15, 2);

	await keyframeManager.clearAll('info');
});

test('First frame has non-black pixel data', async () => {
	await keyframeManager.clearAll('info');

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

	expect(result.type).toBe('success');
	assert(result.type === 'success');
	assert(result.frame);

	// Sample pixel data from the frame to verify it's not completely black
	// testsrc generates a test pattern with colors, gradients, and timestamp overlay
	// For a 640x480 video, we need 640 * 480 * 4 bytes for RGBA
	const bufferSize = result.frame.codedWidth * result.frame.codedHeight * 4;
	const buffer = new Uint8Array(bufferSize);
	await result.frame.copyTo(buffer);

	// Check that not all pixels are zero (black)
	const hasNonZeroPixels = buffer.some((byte) => byte > 0);
	expect(hasNonZeroPixels).toBe(true);

	await keyframeManager.clearAll('info');
});
