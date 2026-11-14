import {expect, test} from 'vitest';
import {getSvgFontSnapshot} from '../drawing/turn-svg-into-drawable';
import {
	svgFeImageReferenceMarkup,
	svgFeImageReferenceModes,
} from './fixtures/svg-feimage-font';
import {svgUseFontData} from './fixtures/svg-use-data-font';

test.for(svgFeImageReferenceModes)(
	'discovers only reachable feImage instance fonts for $0',
	async (mode) => {
		const family = `FeImageReference-${mode}`;
		const urls = await svgUseFontData;
		const style = document.createElement('style');
		style.textContent = `@font-face{font-family:${family};src:url("${urls[0]}")}`;
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.innerHTML = svgFeImageReferenceMarkup(mode, family);
		document.head.appendChild(style);
		document.body.appendChild(svg);
		try {
			// Settle the native style/layout and font readiness before the operation.
			getComputedStyle(svg.querySelector('text')!).getPropertyValue(
				'font-size',
			);
			await document.fonts.ready;
			await new Promise<void>((resolve) =>
				requestAnimationFrame(() => resolve()),
			);
			const before = svg.outerHTML;
			const faces = Array.from(document.fonts, (face) => ({
				face,
				status: face.status,
				loaded: face.loaded,
			}));
			const snapshot = getSvgFontSnapshot(svg);
			const rendered = [
				'href',
				'xlink',
				'nested',
				'cycle',
				'symbol',
				'svg',
			].includes(mode);
			expect(snapshot.cssFontRules.includes(family)).toBe(rendered);
			expect(svg.outerHTML).toBe(before);
			expect(Array.from(document.fonts)).toEqual(faces.map(({face}) => face));
			for (const {face, status, loaded} of faces) {
				expect(face.status).toBe(status);
				expect(face.loaded).toBe(loaded);
			}
		} finally {
			svg.remove();
			style.remove();
		}
	},
);
