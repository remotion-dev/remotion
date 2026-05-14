import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import {assert, expect, test} from 'vitest';
import {audioIteratorManager} from '../audio-iterator-manager';
import {getMaxVideoCacheSize, keyframeManager} from '../caches';
import {makeNonceManager} from '../nonce-manager';
import {extractFrame} from '../video-extraction/extract-frame';
import {videoIteratorManager} from '../video-iterator-manager';

test('in preview, should properly buffer and draw frames', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	const input = new Input({
		source: new UrlSource('/no-frames-in-beginning.webm'),
		formats: ALL_FORMATS,
	});

	const videoTrack = await input.getPrimaryVideoTrack();
	if (!videoTrack) {
		throw new Error('No video track found');
	}

	const manager = await videoIteratorManager({
		getIsLooping: () => false,
		getLoopSegmentMediaEndTimestamp: () => {
			throw new Error('not implemented');
		},
		getStartTime: () => {
			throw new Error('not implemented');
		},
		delayPlaybackHandleIfNotPremounting: () => ({
			unblock: () => {},
			[Symbol.dispose]: () => {},
		}),
		context: null,
		canvas: null,
		videoTrack,
		drawDebugOverlay: () => {},
		logLevel: 'info',
		getOnVideoFrameCallback: () => null,
		getEffects: () => [],
		getEffectChainState: () => null,
		getCurrentFrame: () => 0,
	});

	const nonceManager = makeNonceManager();

	await manager.startVideoIterator(0, nonceManager.createAsyncOperation());
	await manager.seek({
		newTime: 0.03,
		nonce: nonceManager.createAsyncOperation(),
	});
	await manager.seek({
		newTime: 1,
		nonce: nonceManager.createAsyncOperation(),
	});
	await manager.seek({
		newTime: 2,
		nonce: nonceManager.createAsyncOperation(),
	});

	const iteratorsCreated = manager.getVideoIteratorsCreated();
	expect(iteratorsCreated).toBe(1);

	await manager.seek({
		newTime: 4.5,
		nonce: nonceManager.createAsyncOperation(),
	});

	const iteratorsCreated2 = manager.getVideoIteratorsCreated();
	expect(iteratorsCreated2).toBe(2);

	manager.destroy();
});

test('same goes for audio', async () => {
	const input = new Input({
		source: new UrlSource('/no-frames-in-beginning.webm'),
		formats: ALL_FORMATS,
	});

	const audioTrack = await input.getPrimaryAudioTrack();
	if (!audioTrack) {
		throw new Error('No video track found');
	}

	const manager = audioIteratorManager({
		audioTrack,
		delayPlaybackHandleIfNotPremounting: () => ({
			unblock: () => {},
			[Symbol.dispose]: () => {},
		}),
		sharedAudioContext: (() => {
			const audioContext = new AudioContext();
			return {
				audioContext,
				gainNode: audioContext.createGain(),
				audioSyncAnchor: {value: 0},
				scheduleAudioNode: () => ({
					type: 'started',
					scheduledTime: 0,
				}),
				unscheduleAudioNode: () => {},
			};
		})(),
		getMediaEndTimestamp: () => Infinity,
		getSequenceEndTimestamp: () => Infinity,
		getSequenceDurationInSeconds: () => 10,
		getStartTime: () => 0,
		initialMuted: false,
		drawDebugOverlay: () => {},
		initialPlaybackRate: 1,
		initialTrimBefore: undefined,
		initialTrimAfter: undefined,
		initialSequenceOffset: 0,
		initialSequenceDurationInFrames: 10,
		initialLoop: false,
		initialFps: 30,
	});

	const nonceManager = makeNonceManager();

	manager.startAudioIterator({
		nonce: nonceManager.createAsyncOperation(),
		playbackRate: 1,
		startFromSecond: 0.06671494248275864,
		scheduleAudioNode: () => ({
			type: 'started',
			scheduledTime: 0,
		}),
		getTargetTime: (mediaTimestamp: number) => mediaTimestamp,
		logLevel: 'info',
		loop: false,
		unscheduleAudioNode: () => {},
		getAudioContextCurrentTimeMockedInTest: () => 0,
	});

	await manager.waitForNScheduledNodes(2);
	manager.seek({
		newTime: 0.10007241372413796,
		nonce: nonceManager.createAsyncOperation(),
		playbackRate: 1,
		scheduleAudioNode: () => ({
			type: 'started',
			scheduledTime: 0,
		}),
		getTargetTime: (mediaTimestamp: number) => mediaTimestamp,
		logLevel: 'info',
		loop: false,
		trimBefore: undefined,
		trimAfter: undefined,
		sequenceOffset: 0,
		sequenceDurationInFrames: 10,
		fps: 30,
		getAudioContextCurrentTimeMockedInTest: () => 0,
	});

	const iterators = manager.getAudioIteratorsCreated();
	expect(iterators).toBe(1);
});

test('in rendering, should also be smart', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	let lastFrame;
	for (let i = 0; i < 5; i++) {
		const frame = await extractFrame({
			src: '/no-frames-in-beginning.webm',
			timeInSeconds: i * 0.4,
			logLevel: 'info',
			loop: false,
			trimAfter: undefined,
			trimBefore: undefined,
			playbackRate: 1,
			fps: 30,
			maxCacheSize: getMaxVideoCacheSize('info'),
			credentials: undefined,
		});
		assert(frame.type === 'success');
		if (lastFrame) {
			// maybe this assertion is useless, since ht e
			expect(frame.frame?.timestamp === lastFrame.timestamp).toBe(true);
			continue;
		}

		expect(frame.frame?.timestamp).toBe(4.045 * 1_000_000);
		lastFrame = frame.frame;
	}

	const firstRealFrame = await extractFrame({
		src: '/no-frames-in-beginning.webm',
		timeInSeconds: 5,
		logLevel: 'info',
		loop: false,
		trimAfter: undefined,
		trimBefore: undefined,
		playbackRate: 1,
		fps: 30,
		maxCacheSize: getMaxVideoCacheSize('info'),
		credentials: undefined,
	});

	assert(firstRealFrame.type === 'success');
	expect(firstRealFrame.frame?.timestamp).toBe(4.979 * 1_000_000);

	keyframeManager.clearAll('info');
});
