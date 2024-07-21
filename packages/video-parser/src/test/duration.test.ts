import {expect, test} from 'bun:test';
import {getDimensions} from '../get-dimensions';
import {getDuration} from '../get-duration';
import {parseVideo} from '../parse-video';
import {exampleVideos} from './example-videos';

test('Should get duration of video', async () => {
	const parsed = await parseVideo(exampleVideos.framer24fps, 128 * 1024);

	expect(getDuration(parsed)).toBe(4.167);
	expect(getDimensions(parsed)).toEqual([1080, 1080]);
});

test('Should get duration of HEVC video', async () => {
	const parsed = await parseVideo(exampleVideos.iphonehevc, Infinity);
	console.log({parsed});

	expect(getDuration(parsed)).toBe(3.4);
	expect(getDimensions(parsed)).toEqual([1920, 1080]);
});
