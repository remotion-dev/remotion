import {expect, test} from 'bun:test';
import {lzw} from '../gifuct/lzw';

test('throws when a frame declares more pixels than the image data can describe', () => {
	// 65535x65535 frame from 3 bytes of image data.
	expect(() => lzw(2, [0x00, 0x01, 0x02], 65535 * 65535)).toThrow(
		/Invalid GIF frame: 4294836225 pixels requested from 3 bytes of image data/,
	);
});

test('still decodes a frame whose pixel count fits the image data', () => {
	const pixels = lzw(2, [0x44, 0x01], 2);

	expect(pixels.length).toBe(2);
});
