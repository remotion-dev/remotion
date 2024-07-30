import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {nodeReader} from '../from-node';
import {parseMedia} from '../get-video-metadata';

test('Should stream ISO base media', async () => {
	const result = await parseMedia(
		RenderInternals.exampleVideos.iphonevideo,
		{
			durationInSeconds: true,
			fps: true,
		},
		nodeReader,
	);
	expect(result.durationInSeconds).toBe(12.568333333333333);
	expect(result.fps).toBe(29.99602174777881);
});

test('Should stream WebM with no duration', async () => {
	const result = await parseMedia(
		RenderInternals.exampleVideos.nofps,
		{
			durationInSeconds: true,
			fps: true,
			dimensions: true,
			boxes: true,
		},
		nodeReader,
	);
	expect(result.durationInSeconds).toBe(6.57);
	expect(result.fps).toBe(null);
	expect(result.dimensions).toEqual({
		width: 1470,
		height: 690,
	});
});
