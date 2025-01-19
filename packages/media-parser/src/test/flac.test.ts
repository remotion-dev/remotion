import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('parse flac', async () => {
	let samples = 0;
	const {durationInSeconds, tracks} = await parseMedia({
		src: exampleVideos.flac,
		reader: nodeReader,
		fields: {
			durationInSeconds: true,
			tracks: true,
		},
		onAudioTrack: () => {
			return () => {
				samples++;
			};
		},
	});
	expect(durationInSeconds).toBe(19.714285714285715);
	expect(tracks.audioTracks).toEqual([
		{
			codec: 'flac',
			type: 'audio',
			description: new Uint8Array([
				16, 0, 16, 0, 0, 6, 45, 0, 37, 173, 10, 196, 66, 240, 0, 13, 68, 24, 85,
				22, 231, 0, 113, 139, 185, 1, 33, 54, 155, 80, 241, 191, 203, 112,
			]),
			codecPrivate: new Uint8Array([
				16, 0, 16, 0, 0, 6, 45, 0, 37, 173, 10, 196, 66, 240, 0, 13, 68, 24, 85,
				22, 231, 0, 113, 139, 185, 1, 33, 54, 155, 80, 241, 191, 203, 112,
			]),
			codecWithoutConfig: 'flac',
			numberOfChannels: 1,
			sampleRate: 44100,
			timescale: 1000000,
			trackId: 0,
			trakBox: null,
		},
	]);
	expect(samples).toBe(213);
});
