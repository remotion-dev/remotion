import {RenderInternals} from '@remotion/renderer';
import {test} from 'bun:test';
import {nodeReader} from '../from-node';
import {parseMedia} from '../parse-media';

test('Stream samples', async () => {
	await parseMedia({
		src: RenderInternals.exampleVideos.mp4withmp3,
		fields: {
			samples: true,
			boxes: true,
		},
		readerInterface: nodeReader,
	});
});
