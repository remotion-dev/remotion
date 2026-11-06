import {NoReactInternals} from 'remotion/no-react';
import '../symbol-dispose';
import {expect, test} from 'vitest';
import {getEmbeddedFontStyleForSvg} from '../drawing/embed-registered-fonts-in-svg';
import {turnSvgIntoDrawable} from '../drawing/turn-svg-into-drawable';
import {renderStillOnWeb} from '../render-still-on-web';
import {
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
		await savePixelEvidence(reference, `svg-external-font-${frame}-reference`);
		await savePixelEvidence(actual, `svg-external-font-${frame}-actual`);
		await savePixelEvidence(result.diff, `svg-external-font-${frame}-diff`);
		expect(result.mismatchedPixels).toBe(0);
	},
);
