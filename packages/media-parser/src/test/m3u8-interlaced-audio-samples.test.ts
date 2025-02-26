import {test} from 'bun:test';
import {parseMedia} from '../parse-media';

test('should be able to select between audio tracks', async () => {
	await parseMedia({
		src: 'https://cdn.bitmovin.com/content/assets/sintel/hls/playlist.m3u8',
		acknowledgeRemotionLicense: true,
		logLevel: 'info',
		onVideoTrack: (track) => {
			console.log(track);
			return null;
		},
		onAudioTrack: (track) => {
			console.log(track);
			return null;
		},
	});
});
