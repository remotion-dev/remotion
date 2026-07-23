import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import {expect, test} from 'vitest';
import {makeNonceManager} from '../nonce-manager';
import {
	isSequentialMediaTimeAdvance,
	videoIteratorManager,
} from '../video-iterator-manager';

test('detects one timeline frame as a sequential media time advance', () => {
	expect(
		isSequentialMediaTimeAdvance({
			previousTime: 0,
			newTime: 1 / 30,
			fps: 30,
			playbackRate: 1,
			isPlaying: true,
		}),
	).toBe(true);

	expect(
		isSequentialMediaTimeAdvance({
			previousTime: 0,
			newTime: 2 / 30,
			fps: 30,
			playbackRate: 1,
			isPlaying: true,
		}),
	).toBe(false);
});

test('accounts for playback rate when detecting sequential advances', () => {
	expect(
		isSequentialMediaTimeAdvance({
			previousTime: 1,
			newTime: 1 + 2 / 30,
			fps: 30,
			playbackRate: 2,
			isPlaying: true,
		}),
	).toBe(true);

	expect(
		isSequentialMediaTimeAdvance({
			previousTime: 1,
			newTime: 0.9,
			fps: 30,
			playbackRate: 2,
			isPlaying: true,
		}),
	).toBe(false);
});

test('does not treat a paused forward scrub as sequential playback', () => {
	expect(
		isSequentialMediaTimeAdvance({
			previousTime: 1,
			newTime: 1.1,
			fps: 30,
			playbackRate: 4,
			isPlaying: false,
		}),
	).toBe(false);
});

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

const makeManager = (
	videoTrack: Awaited<ReturnType<typeof prepare>>['videoTrack'],
) =>
	videoIteratorManager({
		videoTrack,
		delayPlaybackHandleIfNotPremounting: () => ({
			unblock: () => {},
			[Symbol.dispose]: () => {},
		}),
		context: null,
		canvas: null,
		getOnVideoFrameCallback: () => null,
		logLevel: 'error',
		drawDebugOverlay: () => {},
		getLoopSegmentMediaEndTimestamp: () => {
			throw new Error('not implemented');
		},
		getStartTime: () => {
			throw new Error('not implemented');
		},
		getIsLooping: () => false,
		getEffects: () => [],
		getEffectChainState: () => null,
	});

test('plays at a high playback rate without restarting the iterator', async () => {
	const {videoTrack} = await prepare();
	const manager = await makeManager(videoTrack);
	const nonceManager = makeNonceManager();

	try {
		await manager.startVideoIterator(0, nonceManager.createAsyncOperation());

		for (let frame = 1; frame <= 25; frame++) {
			await manager.seek({
				newTime: (frame * 3.75) / 30,
				nonce: nonceManager.createAsyncOperation(),
				fps: 30,
				playbackRate: 3.75,
				isPlaying: true,
			});
		}

		expect(manager.getVideoIteratorsCreated()).toBe(1);
		expect(manager.getFramesRendered()).toBe(26);
	} finally {
		manager.destroy();
	}
});

test('paused forward scrubs do not wait for pending frames', async () => {
	const {videoTrack} = await prepare();
	const manager = await makeManager(videoTrack);
	const nonceManager = makeNonceManager();

	try {
		await manager.startVideoIterator(0, nonceManager.createAsyncOperation());
		const iterator = manager.getVideoFrameIterator();
		if (!iterator) {
			throw new Error('Expected a video iterator');
		}

		let pendingFrameBehavior: 'wait' | 'restart-iterator' | null = null;
		iterator.tryToSatisfySeek = (_time, options) => {
			pendingFrameBehavior = options.pendingFrameBehavior;
			return Promise.resolve({
				type: 'not-satisfied' as const,
				reason: 'test',
			});
		};

		await manager.seek({
			newTime: 0.1,
			nonce: nonceManager.createAsyncOperation(),
			fps: 30,
			playbackRate: 4,
			isPlaying: false,
		});

		expect(pendingFrameBehavior).toBe('restart-iterator');
	} finally {
		manager.destroy();
	}
});

test('seek should not cause overlapping block/unblock cycles', async () => {
	const {videoTrack} = await prepare();

	let activeBlocks = 0;
	let maxConcurrentBlocks = 0;

	const manager = await videoIteratorManager({
		videoTrack,
		delayPlaybackHandleIfNotPremounting: () => {
			activeBlocks++;
			maxConcurrentBlocks = Math.max(maxConcurrentBlocks, activeBlocks);
			return {
				unblock: () => {
					activeBlocks--;
				},
				[Symbol.dispose]: () => {
					activeBlocks--;
				},
			};
		},
		context: null,
		canvas: null,
		getOnVideoFrameCallback: () => null,
		logLevel: 'error',
		drawDebugOverlay: () => {},
		getLoopSegmentMediaEndTimestamp: () => {
			throw new Error('not implemented');
		},
		getStartTime: () => {
			throw new Error('not implemented');
		},
		getIsLooping: () => false,
		getEffects: () => [],
		getEffectChainState: () => null,
	});

	const nonceManager = makeNonceManager();

	// Initialize the iterator first
	await manager.startVideoIterator(0, nonceManager.createAsyncOperation());

	// Perform seeks that will trigger 'not-satisfied' (jumping around)
	// These should NOT cause overlapping blocks
	await manager.seek({
		newTime: 5,
		nonce: nonceManager.createAsyncOperation(),
		fps: 30,
		playbackRate: 1,
		isPlaying: false,
	});
	await manager.seek({
		newTime: 0,
		nonce: nonceManager.createAsyncOperation(),
		fps: 30,
		playbackRate: 1,
		isPlaying: false,
	});
	await manager.seek({
		newTime: 8,
		nonce: nonceManager.createAsyncOperation(),
		fps: 30,
		playbackRate: 1,
		isPlaying: false,
	});

	// With the fix, max concurrent blocks should be 1
	// Before the fix (fire-and-forget), it could be > 1
	expect(maxConcurrentBlocks).toBe(1);
	expect(activeBlocks).toBe(0); // All blocks should be released
});

test('rapid sequential seeks should not cause overlapping blocks', async () => {
	const {videoTrack} = await prepare();

	let activeBlocks = 0;
	let maxConcurrentBlocks = 0;

	const manager = await videoIteratorManager({
		videoTrack,
		delayPlaybackHandleIfNotPremounting: () => {
			activeBlocks++;
			maxConcurrentBlocks = Math.max(maxConcurrentBlocks, activeBlocks);
			return {
				unblock: () => {
					activeBlocks--;
				},
				[Symbol.dispose]: () => {
					activeBlocks--;
				},
			};
		},
		context: null,
		canvas: null,
		getOnVideoFrameCallback: () => null,
		logLevel: 'error',
		drawDebugOverlay: () => {},
		getLoopSegmentMediaEndTimestamp: () => {
			throw new Error('not implemented');
		},
		getStartTime: () => {
			throw new Error('not implemented');
		},
		getIsLooping: () => false,
		getEffects: () => [],
		getEffectChainState: () => null,
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
			fps: 30,
			playbackRate: 1,
			isPlaying: false,
		});
	}

	// With the fix, max concurrent blocks should be 1
	expect(maxConcurrentBlocks).toBe(1);
	expect(activeBlocks).toBe(0);
});

test('redrawCurrentFrame should not create a new video iterator', async () => {
	const {videoTrack} = await prepare();

	const manager = await videoIteratorManager({
		videoTrack,
		delayPlaybackHandleIfNotPremounting: () => ({
			unblock: () => {},
			[Symbol.dispose]: () => {},
		}),
		context: null,
		canvas: null,
		getOnVideoFrameCallback: () => null,
		logLevel: 'error',
		drawDebugOverlay: () => {},
		getLoopSegmentMediaEndTimestamp: () => {
			throw new Error('not implemented');
		},
		getStartTime: () => {
			throw new Error('not implemented');
		},
		getIsLooping: () => false,
		getEffects: () => [],
		getEffectChainState: () => null,
	});

	const nonceManager = makeNonceManager();

	await manager.startVideoIterator(0, nonceManager.createAsyncOperation());
	expect(manager.getVideoIteratorsCreated()).toBe(1);

	await manager.redrawCurrentFrame();
	await manager.redrawCurrentFrame();

	expect(manager.getVideoIteratorsCreated()).toBe(1);
});
