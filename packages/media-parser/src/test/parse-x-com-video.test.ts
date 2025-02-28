import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';

test('should be able to parse an x.com video', async () => {
	let videoSamples = 0;
	await parseMedia({
		acknowledgeRemotionLicense: true,
		src: 'https://video.twimg.com/ext_tw_video/1859645432948752384/pu/pl/lLW-JnLyATuQct-F.m3u8?tag=14',
		onVideoTrack: () => {
			return (sample) => {
				videoSamples++;
			};
		},
	});

	expect(videoSamples).toBeGreaterThan(0);
});
