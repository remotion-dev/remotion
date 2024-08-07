import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {nodeReader} from '../from-node';
import {getTracks} from '../get-tracks';
import {parseMedia} from '../parse-media';

test('Stream samples', async () => {
	const {boxes} = await parseMedia({
		src: RenderInternals.exampleVideos.mp4withmp3,
		fields: {
			samples: true,
			boxes: true,
		},
		readerInterface: nodeReader,
	});

	const tracks = getTracks(boxes);
	expect(tracks).toEqual([
		{
			type: 'video',
			trackId: 1,
			stcoBox: {
				type: 'stco-box',
				boxSize: 52,
				offset: 808,
				version: 0,
				flags: [0, 0, 0],
				entries: [1637, 7868, 10486, 12041, 14509, 16080, 17741, 20196, 21932],
				entryCount: 9,
			},
			stszBox: {
				type: 'stsz-box',
				boxSize: 60,
				offset: 748,
				version: 0,
				flags: [0, 0, 0],
				sampleSize: 0,
				sampleCount: 10,
				samples: [4834, 437, 698, 595, 548, 611, 701, 535, 776, 586],
			},
		},
		{
			type: 'audio',
			trackId: 2,
			stcoBox: {
				type: 'stco-box',
				boxSize: 52,
				offset: 1421,
				version: 0,
				flags: [0, 0, 0],
				entries: [6908, 8566, 11081, 12589, 15120, 16781, 18276, 20972, 22518],
				entryCount: 9,
			},
			stszBox: {
				type: 'stsz-box',
				boxSize: 20,
				offset: 1401,
				version: 0,
				flags: [0, 0, 0],
				sampleSize: 960,
				sampleCount: 15,
				samples: [],
			},
		},
	]);
});
