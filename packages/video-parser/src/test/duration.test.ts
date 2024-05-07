import {expect, test} from 'bun:test';
import {getDimensions} from '../get-dimensions';
import {getDuration} from '../get-duration';
import {parseVideo} from '../parse-video';
import {exampleVideos} from './example-videos';

test('Should get duration of video', async () => {
	const parsed = await parseVideo(exampleVideos.framer24fps, 128 * 1024);
	if (!parsed) {
		throw new Error('No parsed data');
	}

	const duration = getDuration(parsed);
	expect(duration).toBe(4.167);

	const dimensions = getDimensions(parsed);
	expect(dimensions).toEqual([1080, 1080]);
});

test('Should get duration of HEVC video', async () => {
	const parsed = await parseVideo(exampleVideos.iphonehevc, Infinity);
	if (!parsed) {
		throw new Error('No parsed data');
	}

	const moovBox = parsed[3];
	if (moovBox.type !== 'moov-box') {
		throw new Error('Expected regular box');
	}

	const duration = getDuration(parsed);
	expect(duration).toBe(3.4);

	const dimensions = getDimensions(parsed);
	expect(dimensions).toEqual([1920, 1080]);
});
