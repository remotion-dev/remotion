import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {getSamplePositionsFromTrack} from '../containers/iso-base-media/get-sample-positions-from-track';
import type {TrakBox} from '../containers/iso-base-media/trak/trak';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

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

	const {trakBox, ...trackInfo} = tracks.videoTracks[0];
	expect(trackInfo).toEqual({
		type: 'video',
		trackId: 1,
		description,
		timescale: 15360,
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
		codecPrivate: new Uint8Array([
			1, 100, 0, 32, 255, 225, 0, 32, 103, 100, 0, 32, 172, 217, 64, 68, 2, 39,
			150, 92, 5, 168, 16, 16, 45, 40, 0, 0, 3, 0, 8, 0, 0, 3, 1, 224, 120, 193,
			140, 176, 1, 0, 6, 104, 235, 224, 140, 178, 44, 253, 248, 248, 0,
		]),
		color: {
			fullRange: null,
			transferCharacteristics: null,
			matrixCoefficients: null,
			primaries: null,
		},
		codecWithoutConfig: 'h264',
		fps: 30,
	});

	expect(
		getSamplePositionsFromTrack({trakBox: trakBox as TrakBox, moofBoxes: []}),
	);

	const [firstAudioTrack] = tracks.audioTracks;
	const {trakBox: trakBox2, ...audioTrack} = firstAudioTrack;

	expect(audioTrack).toEqual({
		type: 'audio',
		trackId: 2,
		timescale: 48000,
		numberOfChannels: 2,
		codec: 'mp3',
		sampleRate: 48000,
		description: undefined,
		codecPrivate: null,
		codecWithoutConfig: 'mp3',
	});
	expect(
		getSamplePositionsFromTrack({trakBox: trakBox2 as TrakBox, moofBoxes: []}),
	).toEqual([
		{
			offset: 6908,
			size: 960,
			isKeyframe: true,
			dts: 0,
			duration: 1152,
			cts: 0,
			chunk: 0,
		},
		{
			offset: 8566,
			size: 960,
			isKeyframe: true,
			dts: 1152,
			duration: 1152,
			cts: 1152,
			chunk: 1,
		},
		{
			offset: 9526,
			size: 960,
			isKeyframe: true,
			dts: 2304,
			duration: 1152,
			cts: 2304,
			chunk: 1,
		},
		{
			offset: 11081,
			size: 960,
			isKeyframe: true,
			dts: 3456,
			duration: 1152,
			cts: 3456,
			chunk: 2,
		},
		{
			offset: 12589,
			size: 960,
			isKeyframe: true,
			dts: 4608,
			duration: 1152,
			cts: 4608,
			chunk: 3,
		},
		{
			offset: 13549,
			size: 960,
			isKeyframe: true,
			dts: 5760,
			duration: 1152,
			cts: 5760,
			chunk: 3,
		},
		{
			offset: 15120,
			size: 960,
			isKeyframe: true,
			dts: 6912,
			duration: 1152,
			cts: 6912,
			chunk: 4,
		},
		{
			offset: 16781,
			size: 960,
			isKeyframe: true,
			dts: 8064,
			duration: 1152,
			cts: 8064,
			chunk: 5,
		},
		{
			offset: 18276,
			size: 960,
			isKeyframe: true,
			dts: 9216,
			duration: 1152,
			cts: 9216,
			chunk: 6,
		},
		{
			offset: 19236,
			size: 960,
			isKeyframe: true,
			dts: 10368,
			duration: 1152,
			cts: 10368,
			chunk: 6,
		},
		{
			offset: 20972,
			size: 960,
			isKeyframe: true,
			dts: 11520,
			duration: 1152,
			cts: 11520,
			chunk: 7,
		},
		{
			offset: 22518,
			size: 960,
			isKeyframe: true,
			dts: 12672,
			duration: 1152,
			cts: 12672,
			chunk: 8,
		},
		{
			offset: 23478,
			size: 960,
			isKeyframe: true,
			dts: 13824,
			duration: 1152,
			cts: 13824,
			chunk: 8,
		},
		{
			offset: 24438,
			size: 960,
			isKeyframe: true,
			dts: 14976,
			duration: 1152,
			cts: 14976,
			chunk: 8,
		},
		{
			offset: 25398,
			size: 960,
			isKeyframe: true,
			dts: 16128,
			duration: 1152,
			cts: 16128,
			chunk: 8,
		},
	]);
});
