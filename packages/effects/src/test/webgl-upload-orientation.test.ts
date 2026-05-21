import {expect, test} from 'bun:test';
import {shouldFlipYOnWebGLUpload} from '../webgl-upload-orientation.js';

if (typeof globalThis.HTMLCanvasElement === 'undefined') {
	globalThis.HTMLCanvasElement =
		class HTMLCanvasElement {} as typeof HTMLCanvasElement;
}

const canvasProto = HTMLCanvasElement.prototype;

const asCanvas = (getContext: (kind: string) => unknown): HTMLCanvasElement => {
	const canvas = Object.create(canvasProto) as HTMLCanvasElement;
	canvas.getContext = getContext as HTMLCanvasElement['getContext'];
	return canvas;
};

test('shouldFlipYOnWebGLUpload: ImageBitmap from 2D bridge is not flipped', () => {
	const bitmap = {
		close: () => {},
		width: 1,
		height: 1,
	} as ImageBitmap;
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

test('shouldFlipYOnWebGLUpload: unknown DOM-like sources default to flipped', () => {
	expect(shouldFlipYOnWebGLUpload({} as CanvasImageSource)).toBe(true);
});
