import {expect, test} from 'bun:test';
import {shouldFlipYOnWebGLUpload} from '../webgl-upload-orientation.js';

if (typeof globalThis.HTMLCanvasElement === 'undefined') {
	globalThis.HTMLCanvasElement =
		class HTMLCanvasElement {} as typeof HTMLCanvasElement;
}

if (typeof globalThis.ImageBitmap === 'undefined') {
	globalThis.ImageBitmap = class ImageBitmap {} as typeof ImageBitmap;
}

const canvasProto = HTMLCanvasElement.prototype;

const asCanvas = (getContext: (kind: string) => unknown): HTMLCanvasElement => {
	const canvas = Object.create(canvasProto) as HTMLCanvasElement;
	canvas.getContext = getContext as HTMLCanvasElement['getContext'];
	return canvas;
};

test('shouldFlipYOnWebGLUpload: ImageBitmap from 2D bridge is not flipped', () => {
	const bitmap = Object.create(ImageBitmap.prototype) as ImageBitmap;
	expect(shouldFlipYOnWebGLUpload(bitmap)).toBe(false);
});

test('shouldFlipYOnWebGLUpload: 2D frame canvas is flipped', () => {
	const canvas = asCanvas((kind) => (kind === 'webgl2' ? null : {}));
	expect(shouldFlipYOnWebGLUpload(canvas)).toBe(true);
});

test('shouldFlipYOnWebGLUpload: WebGL ping-pong canvas is not flipped', () => {
	const canvas = asCanvas((kind) => (kind === 'webgl2' ? {} : null));
	expect(shouldFlipYOnWebGLUpload(canvas)).toBe(false);
});

test('shouldFlipYOnWebGLUpload: unrelated sources are not flipped', () => {
	expect(shouldFlipYOnWebGLUpload({} as CanvasImageSource)).toBe(false);
});
