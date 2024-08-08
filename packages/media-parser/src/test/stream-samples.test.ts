import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {nodeReader} from '../from-node';
import {parseMedia} from '../parse-media';

test('Stream samples', async () => {
	const {videoTracks, audioTracks} = await parseMedia({
		src: RenderInternals.exampleVideos.mp4withmp3,
		fields: {
			tracks: true,
		},
		readerInterface: nodeReader,
	});

	const description = new Uint8Array([
		1, 100, 0, 32, 255, 225, 0, 32, 103, 100, 0, 32, 172, 217, 64, 68, 2, 39,
		150, 92, 5, 168, 16, 16, 45, 40, 0, 0, 3, 0, 8, 0, 0, 3, 1, 224, 120, 193,
		140, 176, 1, 0, 6, 104, 235, 224, 140, 178, 44, 253, 248, 248, 0,
	]);

	expect(videoTracks).toEqual([
		{
			type: 'video',
			trackId: 1,
			samplePositions: [
				{
					offset: 1637,
					size: 4834,
					isKeyframe: true,
				},
				{
					offset: 6471,
					size: 437,
					isKeyframe: false,
				},
				{
					offset: 7868,
					size: 698,
					isKeyframe: false,
				},
				{
					offset: 10486,
					size: 595,
					isKeyframe: false,
				},
				{
					offset: 12041,
					size: 548,
					isKeyframe: false,
				},
				{
					offset: 14509,
					size: 611,
					isKeyframe: false,
				},
				{
					offset: 16080,
					size: 701,
					isKeyframe: false,
				},
				{
					offset: 17741,
					size: 535,
					isKeyframe: false,
				},
				{
					offset: 20196,
					size: 776,
					isKeyframe: false,
				},
				{
					offset: 21932,
					size: 586,
					isKeyframe: false,
				},
			],
			description,
			timescale: 15360,
		},
	]);

	expect(audioTracks).toEqual([
		{
			type: 'audio',
			trackId: 2,
			samplePositions: [
				{
					offset: 6908,
					size: 960,
					isKeyframe: true,
				},
				{
					offset: 8566,
					size: 960,
					isKeyframe: true,
				},
				{
					offset: 9526,
					size: 960,
					isKeyframe: true,
				},
				{
					offset: 11081,
					size: 960,
					isKeyframe: true,
				},
				{
					offset: 12589,
					size: 960,
					isKeyframe: true,
				},
				{
					offset: 13549,
					size: 960,
					isKeyframe: true,
				},
				{
					offset: 15120,
					size: 960,
					isKeyframe: true,
				},
				{
					offset: 16781,
					size: 960,
					isKeyframe: true,
				},
				{
					offset: 18276,
					size: 960,
					isKeyframe: true,
				},
				{
					offset: 19236,
					size: 960,
					isKeyframe: true,
				},
				{
					offset: 20972,
					size: 960,
					isKeyframe: true,
				},
				{
					offset: 22518,
					size: 960,
					isKeyframe: true,
				},
				{
					offset: 23478,
					size: 960,
					isKeyframe: true,
				},
				{
					offset: 24438,
					size: 960,
					isKeyframe: true,
				},
				{
					offset: 25398,
					size: 960,
					isKeyframe: true,
				},
			],
			description: null,
			timescale: 48000,
		},
	]);
});
