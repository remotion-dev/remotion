import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {nodeReader} from '../from-node';
import {parseMedia} from '../parse-media';

test('should be able to parse a WebM', async () => {
	const webm = await parseMedia(
		RenderInternals.exampleVideos.transparentWebm,
		{
			durationInSeconds: true,
		},
		nodeReader,
	);
	expect(webm.durationInSeconds).toBe(5);
});
