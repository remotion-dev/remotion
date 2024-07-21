import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {nodeReader} from '../from-node';
import {getDimensions} from '../get-dimensions';
import {getDuration} from '../get-duration';
import {getVideoMetadata} from '../get-video-metadata';

test('Should get duration of video', async () => {
	const parsed = await getVideoMetadata(
		RenderInternals.exampleVideos.framer24fps,
		nodeReader,
	);

	expect(getDuration(parsed)).toBe(4.167);
	expect(getDimensions(parsed)).toEqual([1080, 1080]);
});

test('Should get duration of HEVC video', async () => {
	const parsed = await getVideoMetadata(
		RenderInternals.exampleVideos.iphonehevc,
		nodeReader,
	);

	expect(getDuration(parsed)).toBe(3.4);
	expect(getDimensions(parsed)).toEqual([1920, 1080]);
});
