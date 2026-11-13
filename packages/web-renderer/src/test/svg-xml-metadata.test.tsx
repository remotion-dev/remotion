import {expect, test} from 'vitest';
import {getEmbeddedFontStyleForSvg} from '../drawing/embed-registered-fonts-in-svg';
import '../symbol-dispose';
import {svgExternalFontReady} from './fixtures/svg-external-font-selection';
import {svgXmlMetadataModes, svgXmlMetadata} from './fixtures/svg-xml-metadata';
import {testCompositions} from './utils';

test('renders SVG text alongside XML metadata', async () => {
	await svgExternalFontReady;
	await testCompositions({
		cases: svgXmlMetadataModes.map((mode) => ({
			composition: svgXmlMetadata({mode, literal: false}),
			frame: 1,
		})),
		columns: 3,
		testId: 'svg-xml-metadata',
	});
});

for (const kind of ['foreign', 'svg', 'foreign-object'] as const)
	test(`collects registered font only for rendered text ${kind}`, async () => {
		await svgExternalFontReady;
		const ns = 'http://www.w3.org/2000/svg';
		const svg = document.createElementNS(ns, 'svg');
		svg.style.fontFamily = '"External SVG, class font"';
		const text = document.createElementNS(
			kind === 'foreign'
				? 'urn:metadata'
				: kind === 'foreign-object'
					? 'http://www.w3.org/1999/xhtml'
					: ns,
			'text',
		);
		text.textContent = 'Label';
		if (kind === 'foreign-object') {
			const foreignObject = document.createElementNS(ns, 'foreignObject');
			foreignObject.setAttribute('width', '100');
			foreignObject.setAttribute('height', '30');
			foreignObject.appendChild(text);
			svg.appendChild(foreignObject);
		} else svg.appendChild(text);
		document.body.appendChild(svg);
		try {
			const embedded = getEmbeddedFontStyleForSvg(svg);
			if (kind === 'foreign') expect(embedded).toBeNull();
			else expect(embedded).not.toBeNull();
		} finally {
			svg.remove();
		}
	});
