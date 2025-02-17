import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';

test('Remote transport stream', async () => {
	let videoSamples = 0;
	await parseMedia({
		src: 'https://test-streams.mux.dev/x36xhzz/url_0/url_462/193039199_mp4_h264_aac_hd_7.ts',
		acknowledgeRemotionLicense: true,
		onVideoTrack: () => {
			return () => {
				videoSamples++;
			};
		},
	});
	expect(videoSamples).toBe(600);
});
