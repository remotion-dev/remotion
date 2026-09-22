import {expect, test, vi} from 'vitest';
import {MediaPlayer} from '../media-player';
import type {SharedAudioContextForMediaPlayer} from '../shared-audio-context-for-media-player';

const makeBufferState = () => {
	const noopBufferState = {
		delayPlayback: () => {
			let unblocked = false;
			return {
				unblock: () => {
					if (!unblocked) {
						unblocked = true;
					}
				},
			};
		},
	};

	return noopBufferState;
};

const makeSharedAudioContext = (): SharedAudioContextForMediaPlayer => {
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
};

const makeAudioPlayer = (
	sharedAudioContext: SharedAudioContextForMediaPlayer,
) => {
	return new MediaPlayer({
		canvas: null,
		src: '/voice-note.m4a',
		logLevel: 'error',
		sharedAudioContext,
		loop: false,
		trimBefore: undefined,
		trimAfter: undefined,
		playbackRate: 1,
		toneFrequency: 1,
		globalPlaybackRate: 1,
		audioStreamIndex: null,
		fps: 30,
		debugOverlay: false,
		bufferState: makeBufferState(),
		isPremounting: false,
		isPostmounting: false,
		durationInFrames: 300,
		onVideoFrameCallback: null,
		playing: false,
		sequenceOffset: 0,
		credentials: undefined,
		requestInit: undefined,
		tagType: 'audio',
		getEffects: () => [],
		getEffectChainState: () => null,
	});
};

test('audio-only file should initialize without `audioStreamIndex` (regression for #7210)', async () => {
	const player = makeAudioPlayer(makeSharedAudioContext());

	const result = await player.initialize(0, false, 1);

	expect(result.type).toBe('success');

	await player.dispose();
});

test('uses the initial volume before audio playback is ready', async () => {
	const sharedAudioContext = makeSharedAudioContext();
	const mediaGainNodes: GainNode[] = [];
	const createGain = sharedAudioContext.audioContext.createGain.bind(
		sharedAudioContext.audioContext,
	);
	const createGainSpy = vi
		.spyOn(sharedAudioContext.audioContext, 'createGain')
		.mockImplementation(() => {
			const gainNode = createGain();
			mediaGainNodes.push(gainNode);
			return gainNode;
		});
	const player = makeAudioPlayer(sharedAudioContext);

	try {
		const result = await player.initialize(0, false, 0.25);

		expect(result.type).toBe('success');
		expect(mediaGainNodes).toHaveLength(1);
		expect(mediaGainNodes[0].gain.value).toBe(0.25);

		player.setMuted(true);
		expect(mediaGainNodes[0].gain.value).toBe(0);
		player.setMuted(false);
		expect(mediaGainNodes[0].gain.value).toBe(0.25);
	} finally {
		createGainSpy.mockRestore();
		await player.dispose();
	}
});

test('dispose should immediately unblock playback delays', async () => {
	let activeBlocks = 0;
	let delayPlaybackCalled: () => void = () => {};

	const bufferState = {
		delayPlayback: () => {
			activeBlocks++;
			delayPlaybackCalled();
			let unblocked = false;
			return {
				unblock: () => {
					if (!unblocked) {
						unblocked = true;
						activeBlocks--;
					}
				},
			};
		},
	};

	const audioContext = new AudioContext();
	const sharedAudioContext: SharedAudioContextForMediaPlayer = {
		audioContext,
		gainNode: audioContext.createGain(),
		audioSyncAnchor: {value: 0},
		scheduleAudioNode: () => ({
			type: 'started',
			scheduledTime: 0,
		}),
		unscheduleAudioNode: () => {},
	};

	const player = new MediaPlayer({
		canvas: null,
		src: 'https://remotion.media/video.mp4',
		logLevel: 'error',
		sharedAudioContext,
		loop: false,
		trimBefore: undefined,
		trimAfter: undefined,
		playbackRate: 1,
		toneFrequency: 1,
		globalPlaybackRate: 1,
		audioStreamIndex: 0,
		fps: 30,
		debugOverlay: false,
		bufferState,
		isPremounting: false,
		isPostmounting: false,
		durationInFrames: 300,
		onVideoFrameCallback: null,
		playing: false,
		sequenceOffset: 0,
		credentials: undefined,
		requestInit: undefined,
		tagType: 'video',
		getEffects: () => [],
		getEffectChainState: () => null,
	});

	await player.initialize(0, false, 1);

	const seekDelayPromise = new Promise<void>((resolve) => {
		delayPlaybackCalled = resolve;
	});

	const seekPromise = player.seekTo(9);

	await seekDelayPromise;

	expect(activeBlocks).toBeGreaterThan(0);

	await player.dispose();

	expect(activeBlocks).toBe(0);

	await seekPromise.catch(() => {});
});
