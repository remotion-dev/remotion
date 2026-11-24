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
	onVideoFrame: (() => void) | null,
	catchesUp: boolean,
	getIsPlaying: () => boolean = () => false,
) =>
	videoIteratorManager({
		getCatchesUp: () => catchesUp,
		getIsPlaying,
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
	const manager = await makeManager(videoTrack, null, false);
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
				seekRevision: null,
				mappingChanged: false,
				onMappingApplied: () => {},
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
	const manager = await makeManager(videoTrack, null, false);
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
			seekRevision: null,
			mappingChanged: false,
			onMappingApplied: () => {},
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
		getCatchesUp: () => false,
		getIsPlaying: () => false,
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
		seekRevision: null,
		mappingChanged: false,
		onMappingApplied: () => {},
	});
	await manager.seek({
		continuousPlayback: null,
		newTime: 0,
		nonce: nonceManager.createAsyncOperation(),
		fps: 30,
		playbackRate: 1,
		isPlaying: false,
		seekRevision: null,
		mappingChanged: false,
		onMappingApplied: () => {},
	});
	await manager.seek({
		continuousPlayback: null,
		newTime: 8,
		nonce: nonceManager.createAsyncOperation(),
		fps: 30,
		playbackRate: 1,
		isPlaying: false,
		seekRevision: null,
		mappingChanged: false,
		onMappingApplied: () => {},
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
		getCatchesUp: () => false,
		getIsPlaying: () => false,
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
			seekRevision: null,
			mappingChanged: false,
			onMappingApplied: () => {},
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
		getCatchesUp: () => false,
		getIsPlaying: () => false,
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
	const manager = await makeManager(videoTrack, onVideoFrame, false);
	const nonceManager = makeNonceManager();
	const seek = () =>
		manager.seek({
			newTime: 0,
			nonce: nonceManager.createAsyncOperation(),
			fps: 30,
			playbackRate: 1,
			isPlaying: false,
			continuousPlayback: false,
			seekRevision: null,
			mappingChanged: false,
			onMappingApplied: () => {},
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
	const manager = await makeManager(videoTrack, null, false);
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
			seekRevision: null,
			mappingChanged: false,
			onMappingApplied: () => {},
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
	const manager = await makeManager(videoTrack, null, false);
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
				seekRevision: null,
				mappingChanged: false,
				onMappingApplied: () => {},
			}),
		).rejects.toBe(failure);

		expect(manager.getVideoIteratorsCreated()).toBe(1);
	} finally {
		manager.destroy();
	}
});

test('a superseded seek leaves recreating a reclaimed decoder to the next seek', async () => {
	const {videoTrack} = await prepare();
	const manager = await makeManager(videoTrack, null, false);
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
			seekRevision: null,
			mappingChanged: false,
			onMappingApplied: () => {},
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
			seekRevision: null,
			mappingChanged: false,
			onMappingApplied: () => {},
		});

		expect(manager.getVideoIteratorsCreated()).toBe(2);
		expect(manager.getFramesRendered()).toBe(2);
	} finally {
		manager.destroy();
	}
});

const seekCatchingUp = (
	manager: Awaited<ReturnType<typeof makeManager>>,
	nonceManager: ReturnType<typeof makeNonceManager>,
	newTime: number,
	{isPlaying, seekRevision}: {isPlaying: boolean; seekRevision: number | null},
) =>
	manager.seek({
		newTime,
		nonce: nonceManager.createAsyncOperation(),
		fps: 30,
		playbackRate: 1,
		isPlaying,
		continuousPlayback: null,
		seekRevision,
		mappingChanged: false,
		onMappingApplied: () => {},
	});

test('catches up from the playhead instead of restarting on every tick when playback is not held', async () => {
	const {videoTrack} = await prepare();
	const manager = await makeManager(videoTrack, null, true);
	const nonceManager = makeNonceManager();
	const playing = {isPlaying: true, seekRevision: null};

	try {
		await manager.startVideoIterator(0, nonceManager.createAsyncOperation());
		const framesBefore = manager.getFramesRendered();

		// A jump while playing starts one decoder at the playhead and draws nothing yet.
		await seekCatchingUp(manager, nonceManager, 2, playing);
		const iteratorsAfterJump = manager.getVideoIteratorsCreated();
		expect(manager.isCatchingUp()).toBe(true);
		expect(manager.getFramesRendered()).toBe(framesBefore);

		// Later ticks, a frame apart as in playback, keep decoding forward on that
		// decoder until it draws, in sync.
		let frame = 1;
		while (manager.isCatchingUp() && frame < 30) {
			await new Promise((resolve) => {
				setTimeout(resolve, 1000 / 30);
			});
			await seekCatchingUp(manager, nonceManager, 2 + frame / 30, playing);
			frame++;
		}

		expect(manager.isCatchingUp()).toBe(false);
		expect(manager.getVideoIteratorsCreated()).toBe(iteratorsAfterJump);
		expect(manager.getFramesRendered()).toBe(framesBefore + 1);
	} finally {
		manager.destroy();
	}
});

test('starts catching up again after an explicit seek or a jump back', async () => {
	const {videoTrack} = await prepare();
	const manager = await makeManager(videoTrack, null, true);
	const nonceManager = makeNonceManager();

	try {
		await manager.startVideoIterator(0, nonceManager.createAsyncOperation());
		await seekCatchingUp(manager, nonceManager, 4, {
			isPlaying: true,
			seekRevision: 1,
		});
		const iterators = manager.getVideoIteratorsCreated();

		// An explicit seek (a new revision) starts again at the new time.
		await seekCatchingUp(manager, nonceManager, 4.5, {
			isPlaying: true,
			seekRevision: 2,
		});
		expect(manager.getVideoIteratorsCreated()).toBe(iterators + 1);
		expect(manager.isCatchingUp()).toBe(true);

		// So does a jump back within the same run, such as a loop wrapping.
		await seekCatchingUp(manager, nonceManager, 1, {
			isPlaying: true,
			seekRevision: 2,
		});
		expect(manager.getVideoIteratorsCreated()).toBe(iterators + 2);
		expect(manager.isCatchingUp()).toBe(true);
	} finally {
		manager.destroy();
	}
});

// A looping video starts catching up at its loop start. Wrapping back to that
// same time must start again instead of reusing a decoder near the end.
test('starts catching up again when a loop wraps back to where it started', async () => {
	const {videoTrack} = await prepare();
	const manager = await makeManager(videoTrack, null, true);
	const nonceManager = makeNonceManager();

	try {
		await manager.startCatchUp({time: 2, revision: 1});
		await seekCatchingUp(manager, nonceManager, 5, {
			isPlaying: true,
			seekRevision: 1,
		});
		const iterators = manager.getVideoIteratorsCreated();
		await seekCatchingUp(manager, nonceManager, 2, {
			isPlaying: true,
			seekRevision: 1,
		});
		expect(manager.getVideoIteratorsCreated()).toBe(iterators + 1);
		expect(manager.isCatchingUp()).toBe(true);
	} finally {
		manager.destroy();
	}
});

// A mapping change restarts catch-up once. The player clears its pending flag
// when the restart begins, even if a newer tick supersedes this seek.
test('reports a mapping change as applied when catch-up restarts for it', async () => {
	const {videoTrack} = await prepare();
	const manager = await makeManager(videoTrack, null, true);
	const nonceManager = makeNonceManager();

	try {
		await manager.startCatchUp({time: 2, revision: 1});
		const onMappingApplied = vi.fn();
		const seek = manager.seek({
			newTime: 2.1,
			nonce: nonceManager.createAsyncOperation(),
			fps: 30,
			playbackRate: 1,
			isPlaying: true,
			continuousPlayback: null,
			seekRevision: 1,
			mappingChanged: true,
			onMappingApplied,
		});
		// A newer tick supersedes the seek before its decode finishes.
		nonceManager.createAsyncOperation();
		expect(onMappingApplied).toHaveBeenCalledOnce();
		await seek;
	} finally {
		manager.destroy();
	}
});

// Start-up catches up without a revision, and a seek made during start-up only
// reaches the player once it is ready. It must restart at the new time.
test('restarts start-up catch-up for a seek made during start-up', async () => {
	const {videoTrack} = await prepare();
	const manager = await makeManager(videoTrack, null, true);
	const nonceManager = makeNonceManager();

	try {
		await manager.startCatchUp({time: 4, revision: null});
		const iterators = manager.getVideoIteratorsCreated();

		// Playback continuing from start-up keeps decoding forward.
		await seekCatchingUp(manager, nonceManager, 4.1, {
			isPlaying: true,
			seekRevision: 5,
		});
		expect(manager.getVideoIteratorsCreated()).toBe(iterators);

		await manager.startCatchUp({time: 4, revision: null});
		const restarted = manager.getVideoIteratorsCreated();
		// A jump far beyond the playback since start-up starts again there.
		await seekCatchingUp(manager, nonceManager, 20, {
			isPlaying: true,
			seekRevision: 5,
		});
		expect(manager.getVideoIteratorsCreated()).toBe(restarted + 1);
		expect(manager.isCatchingUp()).toBe(true);
	} finally {
		manager.destroy();
	}
});

test('a paused seek draws the current frame instead of continuing to catch up', async () => {
	const {videoTrack} = await prepare();
	const manager = await makeManager(videoTrack, null, true);
	const nonceManager = makeNonceManager();

	try {
		await manager.startVideoIterator(0, nonceManager.createAsyncOperation());
		const framesBefore = manager.getFramesRendered();
		await seekCatchingUp(manager, nonceManager, 2, {
			isPlaying: true,
			seekRevision: null,
		});
		expect(manager.isCatchingUp()).toBe(true);

		// What MediaPlayer.pause() requests while catching up.
		await seekCatchingUp(manager, nonceManager, 2, {
			isPlaying: false,
			seekRevision: null,
		});
		expect(manager.isCatchingUp()).toBe(false);
		expect(manager.getFramesRendered()).toBe(framesBefore + 1);
	} finally {
		manager.destroy();
	}
});

// Only a few frames are decoded ahead, so at high source frame or playback
// rates a decoder that keeps pace still waits briefly on every tick.
test('finishes catching up when every tick waits briefly for its frame', async () => {
	const {videoTrack} = await prepare();
	const manager = await makeManager(videoTrack, null, true);
	const nonceManager = makeNonceManager();

	try {
		await manager.startCatchUp({time: 2, revision: 1});
		const iterator = manager.getVideoFrameIterator();
		if (!iterator) {
			throw new Error('Expected a video iterator');
		}

		const tryToSatisfySeek = iterator.tryToSatisfySeek.bind(iterator);
		iterator.tryToSatisfySeek = (time, options) => {
			options.onWait?.();
			return tryToSatisfySeek(time, options);
		};

		let frame = 1;
		while (manager.isCatchingUp() && frame < 30) {
			await new Promise((resolve) => {
				setTimeout(resolve, 1000 / 30);
			});
			await seekCatchingUp(manager, nonceManager, 2 + frame / 30, {
				isPlaying: true,
				seekRevision: 1,
			});
			frame++;
		}

		expect(manager.isCatchingUp()).toBe(false);
	} finally {
		manager.destroy();
	}
});

// A paused start that is still decoding when playback starts must not paint
// its mount-time frame after the playhead has moved on.
test('catches up when playback starts while a paused start decodes', async () => {
	const {videoTrack} = await prepare();
	let playing = false;
	const onVideoFrame = vi.fn();
	const manager = await makeManager(
		videoTrack,
		onVideoFrame,
		true,
		() => playing,
	);
	const nonceManager = makeNonceManager();

	try {
		const start = manager.startVideoIterator(
			2,
			nonceManager.createAsyncOperation(),
		);
		playing = true;
		await start;

		expect(manager.isCatchingUp()).toBe(true);
		expect(onVideoFrame).not.toHaveBeenCalled();
	} finally {
		manager.destroy();
	}
});
