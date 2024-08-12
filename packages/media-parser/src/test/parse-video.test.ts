import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {nodeReader} from '../from-node';
import {parseMedia} from '../parse-media';

test('Parse Big Buck bunny', async () => {
	const data = await parseMedia({
		src: RenderInternals.exampleVideos.bigBuckBunny,
		fields: {
			boxes: true,
		},
		reader: nodeReader,
	});
	expect(data.boxes.slice(0, 2)).toEqual([
		{
			offset: 0,
			boxSize: 32,
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
	]);
});

test('Parse framer', async () => {
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.framerWithoutFileExtension,
		fields: {
			boxes: true,
		},
		reader: nodeReader,
	});
	expect(parsed.boxes.slice(0, 2)).toEqual([
		{
			offset: 0,
			boxSize: 32,
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
	]);
});

test('Parse a full video', async () => {
	const data = await parseMedia({
		src: RenderInternals.exampleVideos.framer24fps,
		fields: {boxes: true},
		reader: nodeReader,
	});
	if (!data) throw new Error('No data');

	const [first, second, third] = data.boxes;

	expect(first).toEqual({
		offset: 0,
		boxSize: 32,
		type: 'ftyp-box',
		majorBrand: 'isom',
		minorVersion: 512,
		compatibleBrands: ['isom', 'iso2', 'avc1', 'mp41'],
	});
	expect(second).toEqual({
		offset: 32,
		boxType: 'free',
		boxSize: 8,
		type: 'regular-box',
		children: [],
	});
	expect(third).toEqual({
		type: 'mdat-box',
		boxSize: 57014,
		samplesProcessed: false,
		fileOffset: 40,
	});
});

test('Should warn if missing node reader', () => {
	const data = parseMedia({
		src: RenderInternals.exampleVideos.framer24fps,
		fields: {
			boxes: true,
		},
	});
	expect(data).rejects.toThrow(/node/);
});
