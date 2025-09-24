import {expect, test} from 'bun:test';
import {mediaParserController} from '../controller/media-parser-controller';
import {hasBeenAborted} from '../errors';
import {parseMedia} from '../parse-media';

test.skip('should be able to select between audio tracks', async () => {
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
				if (sample.decodingTimestamp === 896000) {
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

test.skip('should ensure unique track IDs', async () => {
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
	const vidTracks = tracks.filter((t) => t.type === 'video');
	const audTracks = tracks.filter((t) => t.type === 'audio');

	expect(vidTracks[0].trackId).toBe(258);
	expect(audTracks[0].trackId).toBe(257);
	expect(audTracks[1].trackId).toBe(259);
});
