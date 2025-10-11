import {getRemoteExampleVideo} from '@remotion/example-videos';
import {beforeAll, expect, test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';
import {WEBCODECS_TIMESCALE} from '../webcodecs-timescale';

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

	expect(tracks.find((t) => t.type === 'video')).toEqual({
		startInSeconds: 0,
		m3uStreamFormat: null,
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
		originalTimescale: 1000000,
		codedHeight: 1080,
		codedWidth: 1896,
		displayAspectHeight: 1080,
		displayAspectWidth: 1896,
		rotation: 0,
		codecData: null,
		colorSpace: {
			transfer: 'bt709',
			matrix: 'bt709',
			primaries: 'bt709',
			fullRange: null,
		},
		codecEnum: 'h264',
		fps: null,
		advancedColor: {
			fullRange: null,
			matrix: 'bt709',
			primaries: 'bt709',
			transfer: 'bt709',
		},
		timescale: WEBCODECS_TIMESCALE,
		trackMediaTimeOffsetInTrackTimescale: 0,
	});
});
