import {expect, test} from 'bun:test';
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

	const mdiaBox = trak.children[3];
	if (mdiaBox.type !== 'regular-box') {
		throw new Error('Expected regular box');
	}

	const minfBox = mdiaBox.children[2];
	if (minfBox.type !== 'regular-box') {
		throw new Error('Expected minf box');
	}

	const stblBox = minfBox.children[3];
	if (stblBox.type !== 'regular-box') {
		throw new Error('Expected stbl box');
	}

	const stsdBox = stblBox.children[0];
	if (stsdBox.type !== 'stsd-box') {
		throw new Error('Expected stsd box');
	}

	const duration = getDuration(parsed);
	expect(duration).toBe(3.4);
});
