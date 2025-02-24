import {getRemoteExampleVideo} from '@remotion/example-videos';
import {beforeAll, expect, test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

beforeAll(async () => {
	await getRemoteExampleVideo('webmNoCodecPrivate');
});

test('webm with h264 and no codecprivate', async () => {
	const {tracks} = await parseMedia({
		src: await getRemoteExampleVideo('webmNoCodecPrivate'),
		acknowledgeRemotionLicense: true,
		fields: {
			tracks: true,
		},
		reader: nodeReader,
	});

	expect(tracks.videoTracks.length).toBe(1);
	expect(tracks.videoTracks[0]).toEqual({
		type: 'video',
		trackId: 1,
		codec: 'avc1.42c028',
		description: undefined,
		height: 1080,
		width: 1896,
		sampleAspectRatio: {
			numerator: 1,
			denominator: 1,
		},
		timescale: 1000000,
		codedHeight: 1080,
		codedWidth: 1896,
		displayAspectHeight: 1080,
		displayAspectWidth: 1896,
		rotation: 0,
		trakBox: null,
		codecPrivate: null,
		color: {
			transferCharacteristics: 'bt709',
			matrixCoefficients: 'bt709',
			primaries: 'bt709',
			fullRange: null,
		},
		codecWithoutConfig: 'h264',
		fps: null,
	});
});
