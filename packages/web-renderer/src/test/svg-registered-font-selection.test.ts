import {createElement} from 'react';
import {NoReactInternals} from 'remotion/no-react';
import '../symbol-dispose';
import {expect, test} from 'vitest';
import {getEmbeddedFontStyleForSvg} from '../drawing/embed-registered-fonts-in-svg';
import {turnSvgIntoDrawable} from '../drawing/turn-svg-into-drawable';
import {renderFramesOnWeb, renderStillOnWeb} from '../render-still-on-web';
import {
	svgExternalCarrierModes,
	svgExternalEmptyCarrier,
	svgExternalFontReady,
	svgExternalFontSelection,
} from './fixtures/svg-external-font-selection';
import {
	captureNativeReference,
	compareNativePixels,
	savePixelEvidence,
} from './native-reference';

test('embeds only the font faces needed by SVG text', () => {
	const family = 'Registered SVG font selection test';
	const register = ({
		fontData,
		unicodeRange,
		weight,
	}: {
		fontData: ArrayBuffer;
		unicodeRange: string;
		weight: string;
	}) => {
		NoReactInternals.registerFontFace({
			ascentOverride: '90%',
			descentOverride: '20%',
			display: 'swap',
			featureSettings: '"liga" 0',
			fontFamily: family,
			fontData,
			fontUrl: `https://example.com/${weight}-${unicodeRange}.woff2`,
			format: 'woff2',
			lineGapOverride: '10%',
			stretch: null,
			style: 'normal',
			unicodeRange,
			variant: 'small-caps',
			weight,
		});
	};

	register({
		fontData: new Uint8Array([1]).buffer,
		unicodeRange: 'U+0000-00FF',
		weight: '400',
	});
	register({
		fontData: new Uint8Array([2]).buffer,
		unicodeRange: 'U+0400-04FF',
		weight: '400',
	});
	register({
		fontData: new Uint8Array([3]).buffer,
		unicodeRange: 'U+0000-00FF',
		weight: '700',
	});

	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
	text.style.fontFamily = family;
	text.style.fontStyle = 'normal';
	text.style.fontWeight = '400';
	text.textContent = 'Hello';
	svg.appendChild(text);
	document.body.appendChild(svg);

	try {
		const embedded = getEmbeddedFontStyleForSvg(svg);
		expect(embedded).not.toBeNull();
		expect(embedded!.css).toContain('base64,AQ==');
		expect(embedded!.css).not.toContain('base64,Ag==');
		expect(embedded!.css).not.toContain('base64,Aw==');
		expect(embedded!.css).toContain('ascent-override:90%');
		expect(embedded!.css).toContain('descent-override:20%');
		expect(embedded!.css).toContain('font-display:swap');
		expect(embedded!.css).toContain('font-feature-settings:"liga" 0');
		expect(embedded!.css).toContain('line-gap-override:10%');
		expect(embedded!.css).toContain('font-variant:small-caps');
	} finally {
		svg.remove();
	}
});

test('reuses the drawable while an SVG is unchanged', async () => {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('width', '10');
	svg.setAttribute('height', '10');
	const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	rect.setAttribute('width', '10');
	rect.setAttribute('height', '10');
	rect.setAttribute('fill', 'red');
	svg.appendChild(rect);
	document.body.appendChild(svg);

	try {
		const first = await turnSvgIntoDrawable(svg);
		const second = await turnSvgIntoDrawable(svg);
		expect(second).toBe(first);

		rect.setAttribute('fill', 'blue');
		const changed = await turnSvgIntoDrawable(svg);
		expect(changed).not.toBe(first);
	} finally {
		svg.remove();
	}
});

// KINO-7769: external CSS font selection is absent from serialized SVG images.
test.for([0, 1])(
	'external SVG font selection matches native frame %i (KINO-7769)',
	async (frame, t) => {
		// WebKit native/image text differences remain unqualified; Firefox lacks alpha screenshots.
		if (t.task.file.projectName !== 'chromium') {
			t.skip();
			return;
		}

		await svgExternalFontReady;
		const reference = await captureNativeReference(
			svgExternalFontSelection,
			frame,
		);
		const actual = await (
			await renderStillOnWeb({
				composition: svgExternalFontSelection,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const result = await compareNativePixels(reference, actual);
		if (result.mismatchedPixels !== 0) {
			await savePixelEvidence(
				reference,
				`svg-external-font-${frame}-reference`,
			);
			await savePixelEvidence(actual, `svg-external-font-${frame}-actual`);
			await savePixelEvidence(result.diff, `svg-external-font-${frame}-diff`);
		}

		expect(result.mismatchedPixels).toBe(0);
	},
);

// KINO-7769: a final text/plain style used to swallow the carried @font-face.
test('non-CSS style elements retain native and exported font selection', async () => {
	await svgExternalFontReady;
	const cssControl = {
		...svgExternalFontSelection,
		id: 'svg-external-font-selection-css-control',
		component: () =>
			createElement(svgExternalFontSelection.component, {
				styleType: 'text/css',
			}),
	};
	const references = [
		await captureNativeReference(svgExternalFontSelection, 1, {
			omitBackground: false,
		}),
		await captureNativeReference(cssControl, 1, {omitBackground: false}),
	];
	expect(
		(await compareNativePixels(references[0], references[1])).mismatchedPixels,
	).toBe(0);
	const results = [];
	for (const composition of [svgExternalFontSelection, cssControl]) {
		results.push(
			await (
				await renderStillOnWeb({
					composition,
					frame: 1,
					inputProps: {},
					licenseKey: 'free-license',
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'}),
		);
	}

	const comparison = await compareNativePixels(results[0], results[1]);
	if (comparison.mismatchedPixels !== 0) {
		await savePixelEvidence(results[0], 'non-css-style-actual', {
			omitBackground: false,
		});
		await savePixelEvidence(results[1], 'css-style-control', {
			omitBackground: false,
		});
		await savePixelEvidence(comparison.diff, 'non-css-style-diff', {
			omitBackground: false,
		});
	}

	expect(comparison.mismatchedPixels).toBe(0);
});

const carrierOptions = {
	inputProps: {},
	licenseKey: 'free-license',
	allowHtmlInCanvas: false,
} as const;

test.for(
	svgExternalCarrierModes
		.filter((mode) => mode !== 'cache')
		.flatMap((mode) => [0, 1].map((frame) => ({mode, frame}))),
)(
	'preserves external font selection with an empty $mode carrier at frame $frame',
	async ({mode, frame}, t) => {
		await svgExternalFontReady;
		const fixture = svgExternalEmptyCarrier({mode, literal: false});
		const literal = svgExternalEmptyCarrier({mode, literal: true});
		const native = await captureNativeReference(fixture, frame, {
			omitBackground: false,
		});
		const nativeLiteral = await captureNativeReference(literal, frame, {
			omitBackground: false,
		});
		expect(
			(await compareNativePixels(native, nativeLiteral)).mismatchedPixels,
		).toBe(0);
		const actual = await (
			await renderStillOnWeb({...carrierOptions, composition: fixture, frame})
		).blob({format: 'png'});
		const exportedLiteral = await (
			await renderStillOnWeb({...carrierOptions, composition: literal, frame})
		).blob({format: 'png'});
		// Compare every pixel in the complete frames. Native glyph raster gaps in
		// Firefox/WebKit remain separate from structural selector preservation.
		expect(
			(await compareNativePixels(actual, exportedLiteral)).mismatchedPixels,
		).toBe(0);
		if (t.task.file.projectName === 'chromium') {
			expect((await compareNativePixels(native, actual)).mismatchedPixels).toBe(
				0,
			);
		}
	},
);

test('keeps external font carrier batch and fresh frames consistent for CSSOM-only changes', async () => {
	await svgExternalFontReady;
	const fixture = svgExternalEmptyCarrier({mode: 'cache', literal: false});
	const frames = await renderFramesOnWeb({
		...carrierOptions,
		composition: fixture,
		frames: [0, 1, 2],
	});
	const differences = [];
	for (let frame = 0; frame < 3; frame++) {
		const batch = await frames[frame].blob({format: 'png'});
		const fresh = await (
			await renderStillOnWeb({...carrierOptions, composition: fixture, frame})
		).blob({format: 'png'});
		differences.push(
			(await compareNativePixels(batch, fresh)).mismatchedPixels,
		);
	}

	// Includes the existing conservative fallback when a later inactive rule
	// prevents retargeting at frame 1; consistency does not imply native parity.
	expect(differences).toEqual([0, 0, 0]);
});
