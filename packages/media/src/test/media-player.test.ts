import {expect, test} from 'vitest';
import {MediaPlayer} from '../media-player';

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

	const player = new MediaPlayer({
		canvas: null,
		src: 'https://remotion.media/video.mp4',
		logLevel: 'error',
		sharedAudioContext: new AudioContext(),
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
		onVideoFrameCallback: null,
		playing: false,
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
