import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {nodeReader} from '../from-node';
import {getVideoMetadata} from '../get-video-metadata';

test('Should get duration of video', async () => {
	const parsed = await getVideoMetadata(
		RenderInternals.exampleVideos.framer24fps,
		{
			durationInSeconds: true,
			dimensions: true,
		},
		nodeReader,
	);

	expect(parsed.durationInSeconds).toBe(4.167);
	expect(parsed.dimensions).toEqual({width: 1080, height: 1080});
});

test('Should get duration of HEVC video', async () => {
	const parsed = await getVideoMetadata(
		RenderInternals.exampleVideos.iphonehevc,
		{durationInSeconds: true, dimensions: true},
		nodeReader,
	);

	expect(parsed.durationInSeconds).toBe(3.4);
	expect(parsed.dimensions).toEqual({
		width: 1920,
		height: 1080,
	});
});
