import {AudioBufferSink} from 'mediabunny';
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
	sharedAudioContext: SharedAudioContextForMediaPlayer | null,
	onError: ((error: Error) => void) | null = null,
	tagType: 'audio' | 'video' = 'audio',
) => {
	return new MediaPlayer({
		canvas: null,
		src: tagType === 'audio' ? '/voice-note.m4a' : '/bigbuckbunny.mp4',
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
		tagType,
		getEffects: () => [],
		getEffectChainState: () => null,
		onError,
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
		onError: null,
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

test.each(['video'] as const)(
	'reports a required %s seek failure once and stops playback and seeking',
	async (tagType) => {
		const onError = vi.fn();
		const player = makeAudioPlayer(null, onError);
		const error = new TypeError('Failed to fetch');
		const seek = vi.fn(() => Promise.reject(error));
		player[`${tagType}IteratorManager`] = {seek, destroy: vi.fn()} as never;
		player.play();

		await player.seekTo(1);
		player.play();
		await player.seekTo(2);

		expect(onError).toHaveBeenCalledOnce();
		expect(onError).toHaveBeenCalledWith(error);
		expect(seek).toHaveBeenCalledOnce();
		// Inspect playback state without exposing a new public API for this test.
		// eslint-disable-next-line dot-notation
		expect(player['playing']).toBe(false);
		player[`${tagType}IteratorManager`] = null;
		await player.dispose();
	},
);

test.each(['audio', 'video'] as const)(
	'reports a scheduled audio read failure once for %s playback',
	async (tagType) => {
		const onError = vi.fn();
		const player = makeAudioPlayer(makeSharedAudioContext(), onError, tagType);
		await player.initialize(0, false, 1);
		player.audioIteratorManager!.destroyIterator();
		// Observe the existing buffering owner, including scheduler cleanup.
		// eslint-disable-next-line dot-notation
		const delays = player['premountAwareDelayPlayback'];
		const createHandle = delays.createHandle.bind(delays);
		const unblocks = vi.fn();
		vi.spyOn(delays, 'createHandle').mockImplementation(() => {
			const handle = createHandle();
			return {
				...handle,
				unblock: () => {
					unblocks();
					handle.unblock();
				},
			};
		});
		const error = new TypeError('Failed to fetch');
		let rejectRead!: (error: Error) => void;
		const buffers = vi
			.spyOn(AudioBufferSink.prototype, 'buffers')
			.mockImplementation(
				// The read rejects before it can yield an audio buffer.
				// eslint-disable-next-line require-yield
				async function* () {
					await new Promise<void>((_, reject) => {
						rejectRead = reject;
					});
				},
			);
		try {
			await player.seekTo(1);
			await vi.waitFor(() => expect(rejectRead).toBeDefined());
			rejectRead(error);

			await vi.waitFor(() => expect(onError).toHaveBeenCalledWith(error));
			player.play();
			await player.seekTo(2);
			expect(onError).toHaveBeenCalledOnce();
			expect(unblocks).toHaveBeenCalled();
			expect(buffers).toHaveBeenCalledOnce();
			// eslint-disable-next-line dot-notation
			expect(player['playing']).toBe(false);
		} finally {
			buffers.mockRestore();
			await player.dispose();
		}
	},
);

test('ignores pending seek failures after disposal and skips new seeks', async () => {
	const onError = vi.fn();
	const player = makeAudioPlayer(null, onError);
	let rejectSeek!: (error: Error) => void;
	const seek = vi.fn(
		() =>
			new Promise<void>((_, reject) => {
				rejectSeek = reject;
			}),
	);
	player.videoIteratorManager = {seek} as never;

	const pending = player.seekTo(1);
	await vi.waitFor(() => expect(seek).toHaveBeenCalledOnce());
	player.videoIteratorManager = null;
	await player.dispose();
	rejectSeek(new TypeError('Failed to fetch'));
	await pending;
	player.videoIteratorManager = {seek} as never;
	await player.seekTo(2);

	expect(onError).not.toHaveBeenCalled();
	expect(seek).toHaveBeenCalledOnce();
	player.videoIteratorManager = null;
});
