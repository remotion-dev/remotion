import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {paintedPlaneBounds} from './fixtures/painted-plane-bounds';

const renderPixels = async (preserving: boolean, frame: number) => {
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: paintedPlaneBounds(preserving),
		frame,
		inputProps: {},
		allowHtmlInCanvas: false,
		experimental3DRendering: true,
	});
	const bitmap = await createImageBitmap(await still.blob({format: 'png'}));
	try {
		expect([bitmap.width, bitmap.height]).toEqual([300, 300]);
		const context = new OffscreenCanvas(300, 300).getContext('2d')!;
		context.drawImage(bitmap, 0, 0);
		return context.getImageData(0, 0, 300, 300).data;
	} finally {
		bitmap.close();
	}
};

test.for([0, 1])(
	'keeps a negative-depth plane behind its opaque parent at frame %i',
	async (frame) => {
		const preserving = await renderPixels(true, frame);
		// The parent covers the entire child plane. Check every RGBA channel,
		// including antialiased boundaries and alpha, against opaque white.
		expect(preserving.every((channel) => channel === 255)).toBe(true);
		const flat = await renderPixels(false, frame);
		// The same child must still paint when the parent flattens its descendants.
		expect(flat.some((channel) => channel !== 255)).toBe(true);
	},
);
