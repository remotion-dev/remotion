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
		controller,
		onVideoTrack: () => {
			return () => {
				videoSamples++;
			};
		},
		onAudioTrack: () => {
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

test('should ensure unique track IDs', async () => {
	const {tracks} = await parseMedia({
		src: 'https://cdn.bitmovin.com/content/assets/sintel/hls/playlist.m3u8',
		acknowledgeRemotionLicense: true,
		fields: {
			tracks: true,
		},
		selectM3uAssociatedPlaylists: ({associatedPlaylists}) => {
			return associatedPlaylists;
		},
	});
	expect(tracks.videoTracks[0].trackId).toBe(258);
	expect(tracks.audioTracks[0].trackId).toBe(257);
	expect(tracks.audioTracks[1].trackId).toBe(259);
});
