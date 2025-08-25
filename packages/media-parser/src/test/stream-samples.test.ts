import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';
import {WEBCODECS_TIMESCALE} from '../webcodecs-timescale';

test('Stream samples', async () => {
	const {tracks} = await parseMedia({
		src: exampleVideos.mp4withmp3,
		fields: {
			tracks: true,
			videoCodec: true,
			audioCodec: true,
		},
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
	});

	const description = new Uint8Array([
		1, 100, 0, 32, 255, 225, 0, 32, 103, 100, 0, 32, 172, 217, 64, 68, 2, 39,
		150, 92, 5, 168, 16, 16, 45, 40, 0, 0, 3, 0, 8, 0, 0, 3, 1, 224, 120, 193,
		140, 176, 1, 0, 6, 104, 235, 224, 140, 178, 44, 253, 248, 248, 0,
	]);

	const vidTracks = tracks.filter((t) => t.type === 'video');
	expect(vidTracks[0]).toEqual({
		startInSeconds: 0,
		m3uStreamFormat: null,
		type: 'video',
		trackId: 1,
		description,
		originalTimescale: 15360,
		codec: 'avc1.640020',
		sampleAspectRatio: {
			numerator: 1,
			denominator: 1,
		},
		width: 1080,
		height: 1080,
		codedWidth: 1080,
		codedHeight: 1080,
		displayAspectHeight: 1080,
		displayAspectWidth: 1080,
		rotation: 0,
		codecData: {
			type: 'avc-sps-pps',
			data: new Uint8Array([
				1, 100, 0, 32, 255, 225, 0, 32, 103, 100, 0, 32, 172, 217, 64, 68, 2,
				39, 150, 92, 5, 168, 16, 16, 45, 40, 0, 0, 3, 0, 8, 0, 0, 3, 1, 224,
				120, 193, 140, 176, 1, 0, 6, 104, 235, 224, 140, 178, 44, 253, 248, 248,
				0,
			]),
		},
		colorSpace: {
			fullRange: null,
			transfer: null,
			matrix: null,
			primaries: null,
		},
		codecEnum: 'h264',
		fps: 30,
		advancedColor: {
			fullRange: null,
			matrix: null,
			primaries: null,
			transfer: null,
		},
		timescale: WEBCODECS_TIMESCALE,
		trackMediaTimeOffsetInTrackTimescale: 1024,
	});

	const audTracks = tracks.filter((t) => t.type === 'audio');
	expect(audTracks[0]).toEqual({
		startInSeconds: 0,
		type: 'audio',
		trackId: 2,
		originalTimescale: 48000,
		numberOfChannels: 2,
		codec: 'mp3',
		sampleRate: 48000,
		description: undefined,
		codecData: null,
		codecEnum: 'mp3',
		timescale: WEBCODECS_TIMESCALE,
		trackMediaTimeOffsetInTrackTimescale: 1105,
	});
});
