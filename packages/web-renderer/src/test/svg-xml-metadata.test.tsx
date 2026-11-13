import {expect, test} from 'vitest';
import {getEmbeddedFontStyleForSvg} from '../drawing/embed-registered-fonts-in-svg';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {svgExternalFontReady} from './fixtures/svg-external-font-selection';
import {svgXmlMetadataModes, svgXmlMetadata} from './fixtures/svg-xml-metadata';
import {
	captureNativeReference,
	compareNativePixels,
	savePixelEvidence,
} from './native-reference';

test.for(
	svgXmlMetadataModes.flatMap((mode) => [0, 1].map((frame) => ({mode, frame}))),
)('renders XML SVG metadata $mode at frame $frame', async ({mode, frame}) => {
	await svgExternalFontReady;
	const composition = svgXmlMetadata({mode, literal: false});
	const control = svgXmlMetadata({mode, literal: true});
	const reference = await captureNativeReference(composition, frame, {
		omitBackground: false,
	});
	const literal = await captureNativeReference(control, frame, {
		omitBackground: false,
	});
	expect((await compareNativePixels(reference, literal)).mismatchedPixels).toBe(
		0,
	);
	const actual = await (
		await renderStillOnWeb({
			composition,
			frame,
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
		})
	).blob({format: 'png'});
	const result = await compareNativePixels(reference, actual);
	if (result.mismatchedPixels || mode.startsWith('registered-')) {
		await savePixelEvidence(reference, `xml-metadata-${mode}-${frame}-native`, {
			omitBackground: false,
		});
		await savePixelEvidence(actual, `xml-metadata-${mode}-${frame}-actual`, {
			omitBackground: false,
		});
		await savePixelEvidence(result.diff, `xml-metadata-${mode}-${frame}-diff`, {
			omitBackground: false,
		});
	}

	expect(result.mismatchedPixels).toBe(0);
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
