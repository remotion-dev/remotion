import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import path from 'path';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('parse local playlist', async () => {
	let samples = 0;
	await parseMedia({
		src: exampleVideos.localplaylist,
		reader: nodeReader,
		onVideoTrack: () => {
			return () => {
				samples++;
			};
		},
		acknowledgeRemotionLicense: true,
	});
	expect(samples).toBe(253);
});

test('parse single playlist with EXT-X-PROGRAM-DATE-TIME', async () => {
	const singlePlaylist = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'example-videos',
		'videos',
		'single-playlist.m3u8',
	);
	let audioSamples = 0;
	await parseMedia({
		src: singlePlaylist,
		reader: nodeReader,
		onAudioTrack: () => {
			return () => {
				audioSamples++;
			};
		},
		acknowledgeRemotionLicense: true,
	});
	expect(audioSamples).toBeGreaterThan(0);
});
