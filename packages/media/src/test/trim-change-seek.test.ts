import {expect, test} from 'vitest';
import {MediaPlayer} from '../media-player';

test('setTrimBefore should update frame when paused', async () => {
	const canvas = document.createElement('canvas');
	const bufferState = {
		delayPlayback: () => ({unblock: () => {}}),
	};

	const player = new MediaPlayer({
		canvas,
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
		bufferState,
		isPremounting: false,
		isPostmounting: false,
		onVideoFrameCallback: null,
		playing: false,
	});

	const result = await player.initialize(0, false);
	expect(result.type).toBe('success');

	const initialFrames = player.videoIteratorManager!.getFramesRendered();

	player.setTrimBefore(30, 0);

	await new Promise<void>((resolve) => {
		setTimeout(resolve, 100);
	});

	expect(player.videoIteratorManager!.getFramesRendered()).toBeGreaterThan(
		initialFrames,
	);

	await player.dispose();
});

test('setTrimAfter should update frame when paused', async () => {
	const canvas = document.createElement('canvas');
	const bufferState = {
		delayPlayback: () => ({unblock: () => {}}),
	};

	const player = new MediaPlayer({
		canvas,
		src: '/bigbuckbunny.mp4',
		logLevel: 'error',
		sharedAudioContext: null,
		loop: false,
		trimBefore: 60,
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

	const result = await player.initialize(0, false);
	expect(result.type).toBe('success');

	const initialFrames = player.videoIteratorManager!.getFramesRendered();

	player.setTrimAfter(90, 0);

	await new Promise<void>((resolve) => {
		setTimeout(resolve, 100);
	});

	expect(player.videoIteratorManager!.getFramesRendered()).toBeGreaterThan(
		initialFrames,
	);

	await player.dispose();
});
