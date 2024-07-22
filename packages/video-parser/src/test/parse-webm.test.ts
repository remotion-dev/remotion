import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {nodeReader} from '../from-node';
import {getVideoMetadata} from '../get-video-metadata';

test('should be able to parse a WebM', async () => {
	const webm = await getVideoMetadata(
		RenderInternals.exampleVideos.transparentWebm,
		{
			durationInSeconds: true,
			boxes: true,
		},
		nodeReader,
	);
	expect(webm.durationInSeconds).toBe(5);
});
