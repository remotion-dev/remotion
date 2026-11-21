import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import {expect, onTestFinished, test, vi} from 'vitest';
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
	onVideoFrame: (() => void) | null = null,
	decodesAhead = false,
) =>
	videoIteratorManager({
		getDecodesAhead: () => decodesAhead,
		getIsDisposed: () => false,
		videoTrack,
		delayPlaybackHandleIfNotPremounting: () => ({
			unblock: () => {},
			[Symbol.dispose]: () => {},
		}),
		context: null,
		canvas: null,
		getOnVideoFrameCallback: () => onVideoFrame,
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
		maxCanvasSinkFrameSize: null,
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
				continuousPlayback: null,
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
			continuousPlayback: null,
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
		getIsDisposed: () => false,
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
		maxCanvasSinkFrameSize: null,
	});
	onTestFinished(() => manager.destroy());

	const nonceManager = makeNonceManager();

	// Initialize the iterator first
	await manager.startVideoIterator(0, nonceManager.createAsyncOperation());

	// Perform seeks that will trigger 'not-satisfied' (jumping around)
	// These should NOT cause overlapping blocks
	await manager.seek({
		continuousPlayback: null,
		newTime: 5,
		nonce: nonceManager.createAsyncOperation(),
		fps: 30,
		playbackRate: 1,
		isPlaying: false,
	});
	await manager.seek({
		continuousPlayback: null,
		newTime: 0,
		nonce: nonceManager.createAsyncOperation(),
		fps: 30,
		playbackRate: 1,
		isPlaying: false,
	});
	await manager.seek({
		continuousPlayback: null,
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
		getIsDisposed: () => false,
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
		maxCanvasSinkFrameSize: null,
	});
	onTestFinished(() => manager.destroy());

	const nonceManager = makeNonceManager();

	// Initialize the iterator first
	await manager.startVideoIterator(0, nonceManager.createAsyncOperation());

	// Perform many rapid seeks - simulating scrubbing through video
	for (let i = 0; i < 10; i++) {
		// Alternate between distant positions to force iterator recreation
		const time = i % 2 === 0 ? i * 0.5 : 9 - i * 0.5;
		await manager.seek({
			continuousPlayback: null,
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
		getIsDisposed: () => false,
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
		maxCanvasSinkFrameSize: null,
	});
	onTestFinished(() => manager.destroy());

	const nonceManager = makeNonceManager();

	await manager.startVideoIterator(0, nonceManager.createAsyncOperation());
	expect(manager.getVideoIteratorsCreated()).toBe(1);

	await manager.redrawCurrentFrame();
	await manager.redrawCurrentFrame();

	expect(manager.getVideoIteratorsCreated()).toBe(1);
});

test('same-time seeks without changed effects do not emit another frame', async () => {
	const {videoTrack} = await prepare();
	const onVideoFrame = vi.fn();
	const manager = await makeManager(videoTrack, onVideoFrame);
	const nonceManager = makeNonceManager();
	const seek = () =>
		manager.seek({
			newTime: 0,
			nonce: nonceManager.createAsyncOperation(),
			fps: 30,
			playbackRate: 1,
			isPlaying: false,
			continuousPlayback: false,
		});
	try {
		await manager.startVideoIterator(0, nonceManager.createAsyncOperation());
		expect(onVideoFrame).toHaveBeenCalledOnce();
		await seek();
		expect(onVideoFrame).toHaveBeenCalledOnce();
	} finally {
		manager.destroy();
	}
});

const makeReclaimedError = () =>
	new DOMException('Codec reclaimed due to inactivity.', 'QuotaExceededError');

test('recreates the iterator once when the decoder was reclaimed', async () => {
	const {videoTrack} = await prepare();
	const manager = await makeManager(videoTrack);
	const nonceManager = makeNonceManager();

	try {
		await manager.startVideoIterator(0, nonceManager.createAsyncOperation());
		const iterator = manager.getVideoFrameIterator();
		if (!iterator) {
			throw new Error('Expected a video iterator');
		}

		iterator.tryToSatisfySeek = () => Promise.reject(makeReclaimedError());

		await manager.seek({
			continuousPlayback: null,
			newTime: 1,
			nonce: nonceManager.createAsyncOperation(),
			fps: 30,
			playbackRate: 1,
			isPlaying: false,
		});

		expect(iterator.isDestroyed()).toBe(true);
		expect(manager.getVideoIteratorsCreated()).toBe(2);
		expect(manager.getVideoFrameIterator()).not.toBe(iterator);
		expect(manager.getFramesRendered()).toBe(2);
	} finally {
		manager.destroy();
	}
});

test('does not recreate the iterator for quota errors that are not reclaims', async () => {
	const {videoTrack} = await prepare();
	const manager = await makeManager(videoTrack);
	const nonceManager = makeNonceManager();

	try {
		await manager.startVideoIterator(0, nonceManager.createAsyncOperation());
		const iterator = manager.getVideoFrameIterator();
		if (!iterator) {
			throw new Error('Expected a video iterator');
		}

		const failure = new DOMException(
			'Decoder quota exceeded.',
			'QuotaExceededError',
		);
		iterator.tryToSatisfySeek = () => Promise.reject(failure);

		await expect(
			manager.seek({
				continuousPlayback: null,
				newTime: 1,
				nonce: nonceManager.createAsyncOperation(),
				fps: 30,
				playbackRate: 1,
				isPlaying: false,
			}),
		).rejects.toBe(failure);

		expect(manager.getVideoIteratorsCreated()).toBe(1);
	} finally {
		manager.destroy();
	}
});

test('a superseded seek leaves recreating a reclaimed decoder to the next seek', async () => {
	const {videoTrack} = await prepare();
	const manager = await makeManager(videoTrack);
	const nonceManager = makeNonceManager();

	try {
		await manager.startVideoIterator(0, nonceManager.createAsyncOperation());
		const iterator = manager.getVideoFrameIterator();
		if (!iterator) {
			throw new Error('Expected a video iterator');
		}

		iterator.tryToSatisfySeek = () => {
			// A newer seek arrives while this one is failing.
			nonceManager.createAsyncOperation();
			return Promise.reject(makeReclaimedError());
		};

		await manager.seek({
			continuousPlayback: null,
			newTime: 1,
			nonce: nonceManager.createAsyncOperation(),
			fps: 30,
			playbackRate: 1,
			isPlaying: false,
		});

		expect(manager.getVideoFrameIterator()).toBe(null);
		expect(manager.getVideoIteratorsCreated()).toBe(1);

		await manager.seek({
			continuousPlayback: null,
			newTime: 2,
			nonce: nonceManager.createAsyncOperation(),
			fps: 30,
			playbackRate: 1,
			isPlaying: false,
		});

		expect(manager.getVideoIteratorsCreated()).toBe(2);
		expect(manager.getFramesRendered()).toBe(2);
	} finally {
		manager.destroy();
	}
});

test('decodes ahead of the clock instead of restarting at it when playback is not held', async () => {
	const {videoTrack} = await prepare();
	const manager = await makeManager(videoTrack, null, true);
	const nonceManager = makeNonceManager();
	const seekWhilePlaying = (newTime: number) =>
		manager.seek({
			newTime,
			nonce: nonceManager.createAsyncOperation(),
			fps: 30,
			playbackRate: 1,
			isPlaying: true,
			continuousPlayback: null,
		});

	try {
		await manager.startVideoIterator(0, nonceManager.createAsyncOperation());
		const framesBefore = manager.getFramesRendered();

		// A jump while playing starts a decoder ahead of the clock and draws nothing yet.
		await seekWhilePlaying(2);
		const iteratorsAfterJump = manager.getVideoIteratorsCreated();
		expect(iteratorsAfterJump).toBe(2);
		expect(manager.getFramesRendered()).toBe(framesBefore);

		// Before the clock reaches that frame, it waits without restarting.
		await seekWhilePlaying(2 + 1 / 30);
		expect(manager.getVideoIteratorsCreated()).toBe(iteratorsAfterJump);
		expect(manager.getFramesRendered()).toBe(framesBefore);

		// Once the clock is past it (the lead is at most 3 seconds), it draws from the same decoder.
		await seekWhilePlaying(5.1);
		expect(manager.getVideoIteratorsCreated()).toBe(iteratorsAfterJump);
		expect(manager.getFramesRendered()).toBe(framesBefore + 1);
	} finally {
		manager.destroy();
	}
});
