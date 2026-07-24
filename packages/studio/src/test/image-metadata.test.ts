import {expect, test} from 'bun:test';
import {getImageMetadataFromData} from '../helpers/use-image-metadata';

test('gets PNG format and dimensions', () => {
	const png = new Uint8Array(24);
	png.set([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10], 0);
	png.set([0, 0, 7, 128], 16);
	png.set([0, 0, 4, 56], 20);

	expect(getImageMetadataFromData(png)).toEqual({
		format: 'PNG',
		width: 1920,
		height: 1080,
	});
});

test('returns null for non-image data', () => {
	expect(getImageMetadataFromData(new Uint8Array([1, 2, 3, 4]))).toBe(null);
});
