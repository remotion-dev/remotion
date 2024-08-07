import {RenderInternals} from '@remotion/renderer';
import {test} from 'bun:test';
import {nodeReader} from '../from-node';
import {parseMedia} from '../parse-media';

test('Stream samples', async () => {
	const a = await parseMedia(
		RenderInternals.exampleVideos.mp4withmp3,
		{
			samples: true,
			boxes: true,
		},
		nodeReader,
	);
});
