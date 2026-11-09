import {loadFont} from '@remotion/fonts';
import {createElement} from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {NoReactInternals} from 'remotion/no-react';
import {expect, test} from 'vitest';
import {getEmbeddedFontStyleForSvg} from '../drawing/embed-registered-fonts-in-svg';
import {turnSvgIntoDrawable} from '../drawing/turn-svg-into-drawable';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	SvgFontFamilyLifetimeScene,
	svgFontFamilyLifetime,
	svgFontFamilyLifetimeFamily,
	svgFontFamilyLifetimeReady,
	svgFontFamilyLifetimeUrl,
} from './fixtures/svg-font-family-lifetime';
import {compareNativePixels} from './native-reference';

test('embeds only the font faces needed by SVG text', async () => {
	const family = 'Registered SVG font selection test';
	const face = await new FontFace(
		family,
		await NoReactInternals.fetchFontData(
			new URL('../../../example/public/bangers.woff2', import.meta.url).href,
		),
	).load();
	document.fonts.add(face);
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
		document.fonts.delete(face);
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

const mountLifetimeScene = (owner: Document, family: string) => {
	const host = owner.createElement('div');
	owner.body.append(host);
	const root = createRoot(host);
	flushSync(() =>
		root.render(createElement(SvgFontFamilyLifetimeScene, {family})),
	);
	return {
		svg: host.firstElementChild as SVGSVGElement,
		dispose: () => {
			flushSync(() => root.unmount());
			host.remove();
		},
	};
};

const lifetimePng = async (svg: SVGSVGElement) => {
	const canvas = new OffscreenCanvas(680, 100);
	try {
		canvas.getContext('2d')!.drawImage(await turnSvgIntoDrawable(svg), 0, 0);
		return await canvas.convertToBlob({type: 'image/png'});
	} finally {
		canvas.width = 0;
		canvas.height = 0;
	}
};

const referenceFamily = 'SVG font lifetime reference';
const loadLifetimeReference = async () => {
	const before = new Set(document.fonts);
	await loadFont({
		family: referenceFamily,
		url: svgFontFamilyLifetimeUrl,
		format: 'woff2',
	});
	const faces = Array.from(document.fonts).filter(
		(face) =>
			!before.has(face) &&
			face.family.replace(/^(['"])(.*)\1$/, '$2') === referenceFamily,
	);
	return () => {
		for (const face of faces) document.fonts.delete(face);
	};
};

test('font-family snapshots follow removal, re-addition and the owning document (KINO-7769)', async () => {
	const face = await svgFontFamilyLifetimeReady;
	const releaseReference = await loadLifetimeReference();
	const original = mountLifetimeScene(document, svgFontFamilyLifetimeFamily);
	const registered = mountLifetimeScene(document, referenceFamily);
	const fallback = mountLifetimeScene(document, 'serif');
	const iframe = document.createElement('iframe');
	document.body.append(iframe);
	const child = iframe.contentDocument!;
	const other = mountLifetimeScene(child, svgFontFamilyLifetimeFamily);
	const childFallback = mountLifetimeScene(child, 'serif');
	const textWidth = (svg: SVGSVGElement) =>
		(svg.querySelector('text') as SVGTextElement).getComputedTextLength();
	const markup = new XMLSerializer().serializeToString(original.svg);
	try {
		const fontPng = await lifetimePng(registered.svg);
		const fallbackPng = await lifetimePng(fallback.svg);
		expect(textWidth(registered.svg)).not.toBe(textWidth(fallback.svg));
		const check = async (svg: SVGSVGElement, expected: Blob, width: number) => {
			expect(textWidth(svg)).toBe(width);
			const before = Array.from(svg.ownerDocument.fonts);
			const result = await compareNativePixels(
				expected,
				await lifetimePng(svg),
			);
			const after = Array.from(svg.ownerDocument.fonts);
			expect(after.length).toBe(before.length);
			expect(after.every((current, index) => current === before[index])).toBe(
				true,
			);
			expect(result.mismatchedPixels).toBe(0);
		};

		const pending = turnSvgIntoDrawable(original.svg);
		expect(turnSvgIntoDrawable(original.svg)).toBe(pending);
		await check(original.svg, fontPng, textWidth(registered.svg));
		document.fonts.delete(face);
		await check(original.svg, fallbackPng, textWidth(fallback.svg));
		document.fonts.add(face);
		await check(original.svg, fontPng, textWidth(registered.svg));
		await check(
			other.svg,
			await lifetimePng(childFallback.svg),
			textWidth(childFallback.svg),
		);
		const win = iframe.contentWindow! as Window & typeof globalThis;
		const data = NoReactInternals.getRegisteredFontFaces().find(
			(font) => font.fontFamily === svgFontFamilyLifetimeFamily,
		)!.fontData;
		const childFace = await new win.FontFace(
			svgFontFamilyLifetimeFamily,
			data,
		).load();
		child.fonts.add(childFace);
		await check(other.svg, fontPng, textWidth(registered.svg));
		child.fonts.delete(childFace);
		await check(
			other.svg,
			await lifetimePng(childFallback.svg),
			textWidth(childFallback.svg),
		);
		expect(new XMLSerializer().serializeToString(original.svg)).toBe(markup);
	} finally {
		document.fonts.add(face);
		for (const scene of [original, registered, fallback, other, childFallback])
			scene.dispose();
		iframe.remove();
		releaseReference();
	}
});

test.for([0, 1, 2])(
	'preview fixture exports the selected font family at frame %i (KINO-7769)',
	async (frame) => {
		await svgFontFamilyLifetimeReady;
		const releaseReference = await loadLifetimeReference();
		const reference = mountLifetimeScene(
			document,
			frame === 1 ? 'serif' : referenceFamily,
		);
		try {
			const actual = await (
				await renderStillOnWeb({
					composition: svgFontFamilyLifetime,
					frame,
					inputProps: {},
					licenseKey: 'free-license',
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
			const result = await compareNativePixels(
				await lifetimePng(reference.svg),
				actual,
			);
			expect(result.mismatchedPixels).toBe(0);
		} finally {
			reference.dispose();
			releaseReference();
		}
	},
);
