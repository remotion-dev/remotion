import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import {expect, test} from 'vitest';
import {makeNonceManager} from '../nonce-manager';
import {videoIteratorManager} from '../video-iterator-manager';

const prepare = async () => {
	const input = new Input({
		source: new UrlSource('https://remotion.media/video.mp4'),
		formats: ALL_FORMATS,
	});
	const videoTrack = await input.getPrimaryVideoTrack();
	if (!videoTrack) {
		throw new Error('No video track found');
	}

	return {videoTrack};
};

test('seek should not cause overlapping block/unblock cycles', async () => {
	const {videoTrack} = await prepare();

	let activeBlocks = 0;
	let maxConcurrentBlocks = 0;

	const manager = videoIteratorManager({
		videoTrack,
		delayPlaybackHandleIfNotPremounting: () => {
			activeBlocks++;
			maxConcurrentBlocks = Math.max(maxConcurrentBlocks, activeBlocks);
			return {
				unblock: () => {
					activeBlocks--;
				},
			};
		},
		context: null,
		canvas: null,
		getOnVideoFrameCallback: () => null,
		logLevel: 'error',
		drawDebugOverlay: () => {},
		getEndTime: () => {
			throw new Error('not implemented');
		},
		getStartTime: () => {
			throw new Error('not implemented');
		},
		getIsLooping: () => false,
	});

	const nonceManager = makeNonceManager();

	// Initialize the iterator first
	await manager.startVideoIterator(0, nonceManager.createAsyncOperation());

	// Perform seeks that will trigger 'not-satisfied' (jumping around)
	// These should NOT cause overlapping blocks
	await manager.seek({newTime: 5, nonce: nonceManager.createAsyncOperation()});
	await manager.seek({newTime: 0, nonce: nonceManager.createAsyncOperation()});
	await manager.seek({newTime: 8, nonce: nonceManager.createAsyncOperation()});

	// With the fix, max concurrent blocks should be 1
	// Before the fix (fire-and-forget), it could be > 1
	expect(maxConcurrentBlocks).toBe(1);
	expect(activeBlocks).toBe(0); // All blocks should be released
});

test('rapid sequential seeks should not cause overlapping blocks', async () => {
	const {videoTrack} = await prepare();

	let activeBlocks = 0;
	let maxConcurrentBlocks = 0;

	const manager = videoIteratorManager({
		videoTrack,
		delayPlaybackHandleIfNotPremounting: () => {
			activeBlocks++;
			maxConcurrentBlocks = Math.max(maxConcurrentBlocks, activeBlocks);
			return {
				unblock: () => {
					activeBlocks--;
				},
			};
		},
		context: null,
		canvas: null,
		getOnVideoFrameCallback: () => null,
		logLevel: 'error',
		drawDebugOverlay: () => {},
		getEndTime: () => {
			throw new Error('not implemented');
		},
		getStartTime: () => {
			throw new Error('not implemented');
		},
		getIsLooping: () => false,
	});

	const nonceManager = makeNonceManager();

	// Initialize the iterator first
	await manager.startVideoIterator(0, nonceManager.createAsyncOperation());

	// Perform many rapid seeks - simulating scrubbing through video
	for (let i = 0; i < 10; i++) {
		// Alternate between distant positions to force iterator recreation
		const time = i % 2 === 0 ? i * 0.5 : 9 - i * 0.5;
		await manager.seek({
			newTime: time,
			nonce: nonceManager.createAsyncOperation(),
		});
	}

	// With the fix, max concurrent blocks should be 1
	expect(maxConcurrentBlocks).toBe(1);
	expect(activeBlocks).toBe(0);
});
