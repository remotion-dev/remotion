import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('Parse Big Buck bunny', async () => {
	const data = await parseMedia({
		src: exampleVideos.bigBuckBunny,
		fields: {
			structure: true,
		},
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
	});
	expect(data.structure.boxes.slice(0, 2)).toEqual([
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
		src: exampleVideos.framerWithoutFileExtension,
		fields: {
			structure: true,
		},
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
	});
	expect(parsed.structure.boxes.slice(0, 2)).toEqual([
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
		src: exampleVideos.framer24fps,
		fields: {structure: true},
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
	});
	if (!data) throw new Error('No data');

	const [first, second] = data.structure.boxes;

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
});

test('Should warn if missing node reader', () => {
	const data = parseMedia({
		src: exampleVideos.framer24fps,
		fields: {
			structure: true,
		},
		acknowledgeRemotionLicense: true,
	});
	expect(data).rejects.toThrow(/node/);
});
