import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {getDuration} from '../get-duration';
import {parseVideo} from '../parse-video';

const {exampleVideos} = RenderInternals;

test('Should get duration of video', async () => {
	const parsed = await parseVideo(exampleVideos.framer24fps, 128 * 1024);
	if (!parsed) {
		throw new Error('No parsed data');
	}

	const duration = getDuration(parsed);
	expect(duration).toBe(4.167);
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

	const trak = moovBox.children[1];
	if (trak.type !== 'trak-box') {
		throw new Error('Expected trak box');
	}

	console.log(trak.children[3]);

	const duration = getDuration(parsed);
	expect(duration).toBe(3.4);
});
