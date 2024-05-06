import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {getDuration} from '../get-duration';
import {parseVideo} from '../parse-video';

const {exampleVideos} = RenderInternals;

test('Parse Big Buck bunny', async () => {
	const data = await parseVideo(exampleVideos.bigBuckBunny, 4 * 1024);
	expect(data).toEqual([
		{
			offset: 0,
			boxSize: 32,
			boxType: 'ftyp',
			type: 'ftyp-box',
			majorBrand: 'isom',
			minorVersion: 512,
			compatibleBrands: ['isom', 'iso2', 'avc1', 'mp41'],
		},
		{
			offset: 32,
			boxSize: 8,
			boxType: 'free',
			type: 'regular-box',
			children: [],
		},
		{
			boxSize: 14282275,
			boxType: 'mdat',
			offset: 40,
			type: 'regular-box',
			children: [],
		},
	]);
});

test('Parse an iPhone video', async () => {
	const data = await parseVideo(exampleVideos.iphonevideo, 4 * 1024);
	expect(data).toEqual([
		{
			boxSize: 20,
			boxType: 'ftyp',
			type: 'ftyp-box',
			majorBrand: 'qt',
			minorVersion: 0,
			compatibleBrands: ['qt'],
			offset: 0,
		},
		{
			type: 'regular-box',
			boxType: 'wide',
			boxSize: 8,
			offset: 20,
			children: [],
		},
		{
			boxSize: 39048800,
			boxType: 'mdat',
			offset: 28,
			type: 'regular-box',
			children: [],
		},
	]);
});

test('Parse framer', async () => {
	const parsed = await parseVideo(
		exampleVideos.framerWithoutFileExtension,
		4 * 1024,
	);
	expect(parsed).toEqual([
		{
			offset: 0,
			boxSize: 32,
			boxType: 'ftyp',
			compatibleBrands: ['isom', 'iso2', 'avc1', 'mp41'],
			majorBrand: 'isom',
			minorVersion: 512,
			type: 'ftyp-box',
		},
		{
			offset: 32,
			boxSize: 8,
			boxType: 'free',
			type: 'regular-box',
			children: [],
		},
		{
			offset: 40,
			boxSize: 73010,
			boxType: 'mdat',
			children: [],
			type: 'regular-box',
		},
	]);
});

test('Parse a full video', async () => {
	const data = await parseVideo(exampleVideos.framer24fps, Infinity);
	if (!data) throw new Error('No data');

	expect(data[0]).toEqual({
		offset: 0,
		boxSize: 32,
		boxType: 'ftyp',
		type: 'ftyp-box',
		majorBrand: 'isom',
		minorVersion: 512,
		compatibleBrands: ['isom', 'iso2', 'avc1', 'mp41'],
	});
	expect(data[1]).toEqual({
		offset: 32,
		boxType: 'free',
		boxSize: 8,
		type: 'regular-box',
		children: [],
	});
	expect(data[2]).toEqual({
		offset: 40,
		boxSize: 57014,
		boxType: 'mdat',
		children: [],
		type: 'regular-box',
	});

	const moov = data[3];
	if (!moov) {
		throw new Error('No extra data');
	}
});

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

	const duration = getDuration(parsed);
	expect(duration).toBe(3.4);
});
