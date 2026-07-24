import {expect, test} from 'bun:test';
import {uploadElementImage} from '../presentations/upload-element-image';

const elementImage = {
	width: 100,
	height: 100,
} as OffscreenCanvas;

test('uploads the rasterized transition image', () => {
	const calls: unknown[][] = [];
	const gl = {
		TEXTURE_2D: 1,
		RGBA: 2,
		UNSIGNED_BYTE: 3,
		texImage2D(...args: unknown[]) {
			calls.push(args);
		},
	} as unknown as WebGL2RenderingContext;

	uploadElementImage(gl, elementImage);

	expect(calls).toEqual([
		[gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, elementImage],
	]);
});
