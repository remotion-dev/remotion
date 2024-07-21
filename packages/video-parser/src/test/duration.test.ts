import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {readFromNode} from '../from-node';
import {getDimensions} from '../get-dimensions';
import {getDuration} from '../get-duration';

test('Should get duration of video', async () => {
	const parsed = await readFromNode(RenderInternals.exampleVideos.framer24fps);

	expect(getDuration(parsed.segments)).toBe(4.167);
	expect(getDimensions(parsed.segments)).toEqual([1080, 1080]);
});

test('Should get duration of HEVC video', async () => {
	const parsed = await readFromNode(RenderInternals.exampleVideos.iphonehevc);

	expect(getDuration(parsed.segments)).toBe(3.4);
	expect(getDimensions(parsed.segments)).toEqual([1920, 1080]);
});
