import {expect, test, vi} from 'vitest';
import {page, server} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import {svgFontFamilyLifetimeReady} from './fixtures/svg-font-family-lifetime';
import {
	svgReadbackBounds,
	svgReadbackBoundsModes,
} from './fixtures/svg-readback-bounds';
import {captureNativeReference, compareNativePixels} from './native-reference';

test.skipIf(server.browser !== 'webkit')(
	'preserves native SVG text with bounded readback surfaces',
	async () => {
		await svgFontFamilyLifetimeReady;
		for (const mode of svgReadbackBoundsModes) {
			const composition = svgReadbackBounds(mode);
			const allocations: {width: number; height: number}[] = [];
			const {getContext} = OffscreenCanvas.prototype;
			const observer = vi
				.spyOn(OffscreenCanvas.prototype, 'getContext')
				.mockImplementation(function (
					this: OffscreenCanvas,
					...args: Parameters<typeof getContext>
				) {
					if (args[1]?.willReadFrequently)
						allocations.push({width: this.width, height: this.height});
					return getContext.apply(this, args);
				});
			let actual: Blob;
			try {
				actual = await (
					await renderStillOnWeb({
						composition,
						frame: 0,
						inputProps: {},
						licenseKey: 'free-license',
						allowHtmlInCanvas: false,
					})
				).blob({format: 'png'});
			} finally {
				observer.mockRestore();
			}

			const originalViewport = {
				width: window.innerWidth,
				height: window.innerHeight,
			};
			let reference: Blob;
			try {
				// The fixed-geometry reference must be painted beyond the default viewport.
				if (mode === 'large')
					await page.viewport(composition.width + 32, composition.height + 32);
				reference = await captureNativeReference(composition, 0, {
					omitBackground: mode === 'translucent',
				});
			} finally {
				if (mode === 'large')
					await page.viewport(originalViewport.width, originalViewport.height);
			}

			if (mode === 'large') {
				const image = await createImageBitmap(reference);
				const probe = new OffscreenCanvas(1, 1);
				try {
					const context = probe.getContext('2d', {willReadFrequently: true})!;
					for (const [x, y] of [
						[0, 0],
						[composition.width - 1, 0],
						[0, composition.height - 1],
						[composition.width - 1, composition.height - 1],
					]) {
						context.drawImage(image, x, y, 1, 1, 0, 0, 1, 1);
						expect(Array.from(context.getImageData(0, 0, 1, 1).data)).toEqual([
							255, 255, 255, 255,
						]);
					}
				} finally {
					image.close();
					probe.width = 0;
					probe.height = 0;
				}

				expect.soft(allocations).toContainEqual({width: 680, height: 100});
				expect
					.soft(
						allocations.every(
							({width, height}) => width * height <= 16 * 1024 ** 2,
						),
					)
					.toBe(true);
			}

			expect
				.soft(
					(await compareNativePixels(reference, actual)).mismatchedPixels,
					mode,
				)
				.toBe(0);
		}
	},
	60000,
);
