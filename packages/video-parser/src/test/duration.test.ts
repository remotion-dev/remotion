import {expect, test} from 'bun:test';
import {getDimensions} from '../get-dimensions';
import {getDuration} from '../get-duration';
import {loadVideo, parseVideo} from '../parse-video';
import {exampleVideos} from './example-videos';

test('Should get duration of video', async () => {
	const video = await loadVideo(exampleVideos.framer24fps, 128 * 1024);
	const parsed = parseVideo(video);

	expect(getDuration(parsed.segments)).toBe(4.167);
	expect(getDimensions(parsed.segments)).toEqual([1080, 1080]);
});

test('Should get duration of HEVC video', async () => {
	const video = await loadVideo(exampleVideos.iphonehevc, Infinity);
	const parsed = parseVideo(video);

	expect(getDuration(parsed.segments)).toBe(3.4);
	expect(getDimensions(parsed.segments)).toEqual([1920, 1080]);
});
