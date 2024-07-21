import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {writeFileSync} from 'fs';
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
	writeFileSync('out.json', JSON.stringify(webm.boxes, null, 2));
	expect(webm.durationInSeconds).toBe(5);
});
