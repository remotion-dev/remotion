import {expect, test} from 'bun:test';
import {
	detectRemoteImageFileType,
	getRemoteAssetFilename,
} from '../preview-server/routes/download-remote-asset';

test('detects remote PNG dimensions', () => {
	const png = new Uint8Array(24);
	png.set([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10], 0);
	png.set([0, 0, 0, 13], 8);
	png.set([0x49, 0x48, 0x44, 0x52], 12);
	png.set([0, 0, 7, 128], 16);
	png.set([0, 0, 4, 56], 20);

	expect(detectRemoteImageFileType(png)).toEqual({
		type: 'png',
		dimensions: {
			width: 1920,
			height: 1080,
		},
	});
});

test('sanitizes remote asset filenames and uses detected extensions', () => {
	expect(
		getRemoteAssetFilename({
			fileType: {type: 'png', dimensions: null},
			url: new URL('https://example.com/../bad:name.jpg?size=large'),
		}),
	).toBe('bad-name.png');

	expect(
		getRemoteAssetFilename({
			fileType: {type: 'jpeg', dimensions: null},
			url: new URL('https://example.com/photos/image'),
		}),
	).toBe('image.jpg');
});
