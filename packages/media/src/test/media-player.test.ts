import {expect, test} from 'vitest';
import {MediaPlayer} from '../media-player';

test('media player should work', async () => {
	const mediaPlayer = new MediaPlayer({
		audioStreamIndex: 0,
		bufferState: {
			delayPlayback: () => {
				return {unblock() {}};
			},
		},
		canvas: new OffscreenCanvas(100, 100),
		debugOverlay: false,
		fps: 30,
		logLevel: 'info',
		loop: false,
		playbackRate: 1,
		sharedAudioContext: new AudioContext(),
		src: 'https://remotion.media/video.mp4',
		trimAfter: undefined,
		trimBefore: undefined,
	});
	await mediaPlayer.initialize(0);
	expect(mediaPlayer.videoIteratorManager?.getFramesRendered()).toEqual(1);
});
