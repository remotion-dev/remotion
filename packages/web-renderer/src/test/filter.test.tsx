import {expect, test} from 'vitest';
import {applySvgFilterToPrecomposedCanvas} from '../drawing/handle-filter';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {filter} from './fixtures/filter';
import {
	svgFilterReference,
	svgFilterExpandedReference,
	svgFilterBoundingBoxReference,
	svgFilterFractionalReference,
	svgFilterOffsetReference,
} from './fixtures/svg-filter-reference';
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
for (const fixture of [
	svgFilterReference,
	svgFilterExpandedReference,
	svgFilterBoundingBoxReference,
	svgFilterFractionalReference,
	svgFilterOffsetReference,
]) {
	for (const frame of [0, 1]) {
		test(`${fixture.id} matches native painting at frame ${frame}`, async (t) => {
			if (
				t.task.file.projectName === 'firefox' ||
				!('filter' in CanvasRenderingContext2D.prototype)
			) {
				// Firefox cannot capture transparent native references here; WebKit may lack Canvas filters.
				t.skip();
				return;
			}

			const reference = await captureNativeReference(fixture, frame);
			const actual = await (
				await renderStillOnWeb({
					licenseKey: 'free-license',
					composition: fixture,
					frame,
					inputProps: {},
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
			const diff = await compareNativePixels(reference, actual);
			await Promise.all([
				savePixelEvidence(reference, `${fixture.id}-${frame}-native`),
				savePixelEvidence(actual, `${fixture.id}-${frame}-actual`),
				savePixelEvidence(diff.diff, `${fixture.id}-${frame}-diff`),
			]);
			expect(diff.mismatchedPixels).toBe(0);
		});
	}
}

test('SVG filter surfaces release bitmap storage (KINO-7772)', () => {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.innerHTML =
		'<filter id="filter-disposal" filterUnits="userSpaceOnUse" x="-2" y="-2" width="14" height="14"><feGaussianBlur stdDeviation="1" /></filter>';
	document.body.append(svg);
	try {
		const source = new OffscreenCanvas(10, 10);
		const layer = applySvgFilterToPrecomposedCanvas({
			source,
			scale: 1,
			sourceRect: new DOMRect(0, 0, 10, 10),
			filter: 'url(#filter-disposal)',
			ownerDocument: document,
		});
		const clone = document.querySelector('[id^="remotion-filter-"]')!;
		expect(clone).not.toBeNull();
		layer[Symbol.dispose]();
		expect(clone.isConnected).toBe(false);
		expect(layer.canvas.width).toBe(0);
		expect(layer.canvas.height).toBe(0);
	} finally {
		svg.remove();
	}
});
