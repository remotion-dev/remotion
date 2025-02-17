import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';

test('aac packets smaller than 188', async () => {
	let lastAudioTimestamp = 0;
	let audioSamples = 0;
	await parseMedia({
		src: 'https://test-streams.mux.dev/x36xhzz/url_0/url_462/193039199_mp4_h264_aac_hd_7.ts',
		acknowledgeRemotionLicense: true,
		logLevel: 'info',
		onAudioTrack: () => {
			return (s) => {
				if (s.dts < lastAudioTimestamp) {
					throw new Error('Audio timestamp is not increasing');
				}

				lastAudioTimestamp = s.dts;
				audioSamples += 1;
			};
		},
	});
	expect(audioSamples).toBe(431);
});
