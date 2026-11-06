import {expect, test} from 'vitest';
import {applySvgFilterToPrecomposedCanvas} from '../drawing/handle-filter';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {filter} from './fixtures/filter';
import {svgFilterReference} from './fixtures/svg-filter-reference';
import {
	captureNativeReference,
	compareNativePixels,
	savePixelEvidence,
} from './native-reference';
import {testImage} from './utils';

test('should render filter', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: filter,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'filter'});
});

// KINO-7772: OffscreenCanvas accepts the URL string but ignores the SVG effect.
for (const frame of [0, 1]) {
	test(`same-document SVG filters match native painting at frame ${frame}`, async (t) => {
		if (
			t.task.file.projectName === 'firefox' ||
			!('filter' in CanvasRenderingContext2D.prototype)
		) {
			// Firefox cannot capture transparent native references here; WebKit may lack Canvas filters.
			t.skip();
			return;
		}

		const reference = await captureNativeReference(svgFilterReference, frame);
		const actual = await (
			await renderStillOnWeb({
				licenseKey: 'free-license',
				composition: svgFilterReference,
				frame,
				inputProps: {},
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const diff = await compareNativePixels(reference, actual);
		await Promise.all([
			savePixelEvidence(reference, `svg-filter-${frame}-native`),
			savePixelEvidence(actual, `svg-filter-${frame}-actual`),
			savePixelEvidence(diff.diff, `svg-filter-${frame}-diff`),
		]);
		expect(diff.mismatchedPixels).toBe(0);
	});
}

test('SVG filter surfaces release bitmap storage (KINO-7772)', () => {
	const source = new OffscreenCanvas(10, 10);
	const layer = applySvgFilterToPrecomposedCanvas({
		source,
		sourceRect: new DOMRect(0, 0, 10, 10),
		filter: 'none',
		ownerDocument: document,
	});
	layer[Symbol.dispose]();
	expect(layer.canvas.width).toBe(0);
	expect(layer.canvas.height).toBe(0);
});
