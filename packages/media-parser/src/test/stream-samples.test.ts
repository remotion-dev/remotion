import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
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
		m3uStreamFormat: null,
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
});
