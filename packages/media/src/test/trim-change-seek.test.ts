import {expect, test} from 'vitest';
import {MediaPlayer} from '../media-player';

test('setTrimBefore and setTrimAfter should update frame when paused', async () => {
	const player = new MediaPlayer({
		canvas: null,
		src: '/bigbuckbunny.mp4',
		logLevel: 'error',
		sharedAudioContext: null,
		loop: false,
		trimBefore: undefined,
		trimAfter: undefined,
		playbackRate: 1,
		globalPlaybackRate: 1,
		audioStreamIndex: 0,
		fps: 30,
		debugOverlay: false,
		bufferState: {delayPlayback: () => ({unblock: () => {}})},
		isPremounting: false,
		isPostmounting: false,
		onVideoFrameCallback: null,
		playing: false,
	});

	await player.initialize(0, false);

	const initialFrames = player.videoIteratorManager!.getFramesRendered();
	await player.setTrimBefore(30, 0);
	expect(player.videoIteratorManager!.getFramesRendered()).toBeGreaterThan(
		initialFrames,
	);

	const framesAfterTrimBefore =
		player.videoIteratorManager!.getFramesRendered();
	await player.setTrimAfter(90, 0);
	expect(player.videoIteratorManager!.getFramesRendered()).toBeGreaterThan(
		framesAfterTrimBefore,
	);

	await player.dispose();
});
