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
	expect(tracks).toEqual([{type: 'video'}, {type: 'audio'}]);

	await Bun.write('stream-samples.json', JSON.stringify(boxes, null, 2));
});
