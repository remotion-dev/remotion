import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {nodeReader} from '../from-node';
import {parseMedia} from '../get-video-metadata';

test('Should stream', async () => {
	const result = await parseMedia(
		RenderInternals.exampleVideos.iphonevideo,
		{
			durationInSeconds: true,
			boxes: true,
		},
		nodeReader,
	);
	await Bun.write('boxes.json', JSON.stringify(result.boxes, null, 2));
	expect(result.durationInSeconds).toBe(12.568333333333333);
});
