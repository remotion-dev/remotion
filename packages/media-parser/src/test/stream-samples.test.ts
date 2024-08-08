import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {nodeReader} from '../from-node';
import {getTracks} from '../get-tracks';
import {parseMedia} from '../parse-media';

test('Stream samples', async () => {
	const {boxes} = await parseMedia({
		src: RenderInternals.exampleVideos.mp4withmp3,
		fields: {
			boxes: true,
		},
		readerInterface: nodeReader,
	});

	const description = new Uint8Array([
		1, 100, 0, 32, 255, 225, 0, 32, 103, 100, 0, 32, 172, 217, 64, 68, 2, 39,
		150, 92, 5, 168, 16, 16, 45, 40, 0, 0, 3, 0, 8, 0, 0, 3, 1, 224, 120, 193,
		140, 176, 1, 0, 6, 104, 235, 224, 140, 178, 44, 253, 248, 248, 0,
	]);

	const tracks = getTracks(boxes);
	expect(tracks).toEqual([
		{
			type: 'video',
			trackId: 1,
			samplePositions: [
				{
					offset: 1637,
					size: 4834,
				},
				{
					offset: 6471,
					size: 437,
				},
				{
					offset: 7868,
					size: 698,
				},
				{
					offset: 10486,
					size: 595,
				},
				{
					offset: 12041,
					size: 548,
				},
				{
					offset: 14509,
					size: 611,
				},
				{
					offset: 16080,
					size: 701,
				},
				{
					offset: 17741,
					size: 535,
				},
				{
					offset: 20196,
					size: 776,
				},
				{
					offset: 21932,
					size: 586,
				},
			],
			description,
		},
		{
			type: 'audio',
			trackId: 2,
			samplePositions: [
				{
					offset: 6908,
					size: 960,
				},
				{
					offset: 8566,
					size: 960,
				},
				{
					offset: 9526,
					size: 960,
				},
				{
					offset: 11081,
					size: 960,
				},
				{
					offset: 12589,
					size: 960,
				},
				{
					offset: 13549,
					size: 960,
				},
				{
					offset: 15120,
					size: 960,
				},
				{
					offset: 16781,
					size: 960,
				},
				{
					offset: 18276,
					size: 960,
				},
				{
					offset: 19236,
					size: 960,
				},
				{
					offset: 20972,
					size: 960,
				},
				{
					offset: 22518,
					size: 960,
				},
				{
					offset: 23478,
					size: 960,
				},
				{
					offset: 24438,
					size: 960,
				},
				{
					offset: 25398,
					size: 960,
				},
			],
			description: null,
		},
	]);
});
