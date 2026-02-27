import {expect, test} from 'vitest';
import {MediaPlayer} from '../media-player';
import type {SharedAudioContextForMediaPlayer} from '../shared-audio-context-for-media-player';

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
		audioSyncAnchor: {value: 0},
		scheduleAudioNode: () => true,
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
	});

	await player.initialize(0, false);

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
