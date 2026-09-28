import {expect, test} from 'vitest';
import {MediaPlayer} from '../media-player';

test('setTrimRange should atomically update trims when paused', async () => {
	const player = new MediaPlayer({
		canvas: null,
		src: '/bigbuckbunny.mp4',
		logLevel: 'error',
		sharedAudioContext: null,
		loop: false,
		trimBefore: undefined,
		trimAfter: undefined,
		playbackRate: 1,
		toneFrequency: 1,
		globalPlaybackRate: 1,
		audioStreamIndex: 0,
		fps: 30,
		debugOverlay: false,
		bufferState: {delayPlayback: () => ({unblock: () => {}})},
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

	const initialFrames = player.videoIteratorManager!.getFramesRendered();
	await player.setTrimRange(30, 90, 0);
	expect(player.videoIteratorManager!.getFramesRendered()).toBeGreaterThan(
		initialFrames,
	);

	const framesAfterFirstTrim = player.videoIteratorManager!.getFramesRendered();
	await player.setTrimRange(120, 180, 0);
	expect(player.videoIteratorManager!.getFramesRendered()).toBeGreaterThan(
		framesAfterFirstTrim,
	);

	await player.dispose();
});
