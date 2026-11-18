import {expect, test, vi} from 'vitest';
import {server} from 'vitest/browser';
import {renderFramesOnWeb, renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {svgFontFamilyLifetimeReady} from './fixtures/svg-font-family-lifetime';
import {svgReadbackMask} from './fixtures/svg-readback-mask';
import {compareNativePixels} from './native-reference';

test('uses SVG readback through CSS mask precomposition', async () => {
	await svgFontFamilyLifetimeReady;
	const original = OffscreenCanvas.prototype.getContext;
	for (const mode of ['none', 'css', 'important', 'url'] as const) {
		let readbacks = 0;
		const spy = vi
			.spyOn(OffscreenCanvas.prototype, 'getContext')
			.mockImplementation(function (this: OffscreenCanvas, contextId, options) {
				if (contextId === '2d' && options?.willReadFrequently) readbacks++;
				return original.call(this, contextId, options);
			});
		try {
			await renderStillOnWeb({
				composition: svgReadbackMask(mode),
				frame: 0,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			});
			expect(readbacks, mode).toBe(server.browser === 'webkit' ? 1 : 0);
		} finally {
			spy.mockRestore();
		}
	}
});

test('keeps SVG readback consistent when masks change between frames', async () => {
	await svgFontFamilyLifetimeReady;
	let readbacks = 0;
	const original = OffscreenCanvas.prototype.getContext;
	const spy = vi
		.spyOn(OffscreenCanvas.prototype, 'getContext')
		.mockImplementation(function (this: OffscreenCanvas, contextId, options) {
			if (contextId === '2d' && options?.willReadFrequently) readbacks++;
			return original.call(this, contextId, options);
		});
	const composition = svgReadbackMask('toggle');
	const renderOptions = {
		composition,
		inputProps: {},
		licenseKey: 'free-license',
		allowHtmlInCanvas: false,
	} as const;
	let frames: Awaited<ReturnType<typeof renderFramesOnWeb>>;
	try {
		frames = await renderFramesOnWeb({...renderOptions, frames: [0, 1, 2]});
		expect(readbacks).toBe(server.browser === 'webkit' ? 3 : 0);
	} finally {
		spy.mockRestore();
	}

	for (const frame of [0, 1, 2]) {
		const fresh = await renderStillOnWeb({...renderOptions, frame});
		expect(
			(
				await compareNativePixels(
					await frames[frame].blob({format: 'png'}),
					await fresh.blob({format: 'png'}),
				)
			).mismatchedPixels,
		).toBe(0);
	}
});
