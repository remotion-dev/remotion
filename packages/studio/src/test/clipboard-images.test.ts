import {expect, test} from 'bun:test';
import {
	getClipboardImageFiles,
	getUniqueClipboardImageName,
	hasClipboardImage,
} from '../helpers/clipboard-images';

const makeClipboardData = (files: File[]): DataTransfer => {
	return {
		files,
		items: [],
	} as unknown as DataTransfer;
};

test('gets images from clipboard items', () => {
	const image = new File(['image'], 'image.png', {type: 'image/png'});
	const clipboardData = {
		files: [],
		items: [
			{
				kind: 'file',
				type: 'image/png',
				getAsFile: () => image,
			},
		],
	} as unknown as DataTransfer;

	expect(hasClipboardImage(clipboardData)).toBe(true);
	expect(
		getClipboardImageFiles({clipboardData, existingFileNames: []}),
	).toEqual([image]);
});

test('gets images from clipboard files and ignores other files', () => {
	const image = new File(['image'], 'image.png', {type: 'image/png'});
	const text = new File(['text'], 'notes.txt', {type: 'text/plain'});
	const clipboardData = makeClipboardData([image, text]);

	expect(hasClipboardImage(clipboardData)).toBe(true);
	expect(
		getClipboardImageFiles({clipboardData, existingFileNames: []}),
	).toEqual([image]);
});

test('gives unnamed and duplicate clipboard images unique names', () => {
	expect(
		getUniqueClipboardImageName({
			existingFileNames: new Set(['pasted-image.png']),
			fileName: '',
			mimeType: 'image/png',
		}),
	).toBe('pasted-image-1.png');
	expect(
		getUniqueClipboardImageName({
			existingFileNames: new Set(['image.png', 'image-1.png']),
			fileName: 'image.png',
			mimeType: 'image/png',
		}),
	).toBe('image-2.png');
});

test('uses an extension matching the clipboard MIME type', () => {
	const jpeg = new File(['image'], '', {type: 'image/jpeg'});
	const clipboardData = makeClipboardData([jpeg]);

	expect(
		getClipboardImageFiles({clipboardData, existingFileNames: []})[0]?.name,
	).toBe('pasted-image.jpg');
});

test('keeps copied SVG files available for the SVG import dialog', () => {
	const svg = new File(['<svg />'], 'icon.svg', {type: 'image/svg+xml'});
	const clipboardData = makeClipboardData([svg]);

	expect(
		getClipboardImageFiles({clipboardData, existingFileNames: []}),
	).toEqual([svg]);
});
