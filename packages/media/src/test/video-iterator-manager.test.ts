import {ALL_FORMATS, EncodedPacketSink, Input, UrlSource} from 'mediabunny';
import type {EffectDefinitionAndStack} from 'remotion';
import {Internals} from 'remotion';
import {expect, onTestFinished, test} from 'vitest';
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

test('reuses effect output while seeks stay within one decoded frame', async () => {
	const input = new Input({
		source: new UrlSource('/red-heart-1x.webm'),
		formats: ALL_FORMATS,
	});
	onTestFinished(() => input.dispose());
	const videoTrack = await input.getPrimaryVideoTrack();
	if (!videoTrack) {
		throw new Error('No video track found');
	}

	const firstPacket = await new EncodedPacketSink(videoTrack).getFirstPacket();
	if (!firstPacket || firstPacket.duration <= 0) {
		throw new Error('Expected a first packet with a duration');
	}

	const frameDuration = firstPacket.duration;
	const canvas = document.createElement('canvas');
	const chainState = Internals.createEffectChainState(1, 1);
	onTestFinished(() => Internals.cleanupEffectChainState(chainState));
	let applied = 0;
	const makeEffects = (): EffectDefinitionAndStack<unknown>[] => [
		{
			memoized: true,
			effectKey: 'count',
			params: {},
			definition: {
				type: 'count',
				label: 'count',
				documentationLink: null,
				backend: '2d',
				calculateKey: () => 'count',
				schema: {},
				validateParams: () => {},
				setup: () => null,
				cleanup: () => {},
				apply: ({target, source}) => {
					applied++;
					target.getContext('2d')!.drawImage(source, 0, 0);
				},
			},
		},
	];
	let effects = makeEffects();

	const manager = await videoIteratorManager({
		getIsDisposed: () => false,
		videoTrack,
		delayPlaybackHandleIfNotPremounting: () => ({
			unblock: () => {},
			[Symbol.dispose]: () => {},
		}),
		context: canvas.getContext('2d'),
		canvas,
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
		getEffects: () => effects,
		getEffectChainState: () => chainState,
		maxCanvasSinkFrameSize: null,
	});
	onTestFinished(() => manager.destroy());
	const nonceManager = makeNonceManager();
	const seek = (newTime: number) =>
		manager.seek({
			newTime,
			nonce: nonceManager.createAsyncOperation(),
			fps: 60,
			playbackRate: 1,
			isPlaying: true,
			continuousPlayback: true,
		});

	await manager.startVideoIterator(0, nonceManager.createAsyncOperation());
	expect(applied).toBe(1);

	// Like a 60 fps composition showing a lower frame rate video.
	await seek(frameDuration / 4);
	await seek(frameDuration / 2);
	expect(manager.getFramesRendered()).toBe(3);
	expect(applied).toBe(1);

	await seek(frameDuration * 1.25);
	expect(manager.getFramesRendered()).toBe(4);
	expect(applied).toBe(2);

	// Changed effects need a new output, even for the same decoded frame.
	effects = makeEffects();
	await seek(frameDuration * 1.5);
	expect(applied).toBe(3);

	// An explicit redraw always reruns the effects.
	await manager.redrawCurrentFrame();
	expect(applied).toBe(4);
});
