import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';

test.skip('should be able to parse an x.com video', async () => {
	let videoSamples = 0;
	let audioSamples = 0;
	let videoTracks = 0;
	let audioTracks = 0;

	await parseMedia({
		acknowledgeRemotionLicense: true,
		src: 'https://video.twimg.com/amplify_video/1851740078185259008/pl/f1p1QxiEbwSGItpQ.m3u8?tag=16',
		onVideoTrack: () => {
			videoTracks++;
			return () => {
				videoSamples++;
			};
		},
		onAudioTrack: () => {
			audioTracks++;
			return () => {
				audioSamples++;
			};
		},
	});

	expect(videoSamples).toBe(248);
	expect(audioTracks).toBe(1);
	expect(audioSamples).toBe(359);
	expect(videoTracks).toBe(1);
});
