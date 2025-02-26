import {expect, test} from 'bun:test';
import {hasBeenAborted} from '../errors';
import {mediaParserController} from '../media-parser-controller';
import {parseMedia} from '../parse-media';

test('should be able to select between audio tracks', async () => {
	let videoSamples = 0;
	let audioSamples = 0;

	const controller = mediaParserController();

	await parseMedia({
		src: 'https://cdn.bitmovin.com/content/assets/sintel/hls/playlist.m3u8',
		acknowledgeRemotionLicense: true,
		logLevel: 'info',
		controller,
		onVideoTrack: () => {
			return () => {
				videoSamples++;
				// TODO: Should have unique track IDs
			};
		},
		onAudioTrack: () => {
			// TODO: Should have unique track IDs
			return (sample) => {
				audioSamples++;
				if (sample.dts === 896000) {
					controller.abort();
				}
			};
		},
	}).catch((err) => {
		expect(hasBeenAborted(err)).toBe(true);
	});
	expect(videoSamples).toBe(22);
	expect(audioSamples).toBe(44);
});
