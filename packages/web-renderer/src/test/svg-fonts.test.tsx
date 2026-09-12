import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {buildSvgFontFaceCss, embedFontFaceCssInSvgMarkup} from '../svg-fonts';
import {svgFontsFixture} from './fixtures/svg-fonts';
import {svgFontsNoTextFixture} from './fixtures/svg-fonts-no-text';
import {testImage} from './utils';

const FAMILY = 'Bangers';

const loadFontIntoPage = async () => {
	const data = await (
		await fetch('/src/test/fonts/bangers.woff2')
	).arrayBuffer();
	const face = new FontFace(FAMILY, data);
	await face.load();
	document.fonts.add(face);

	return data;
};

test('svgFonts makes SVG text render with the loaded font', async () => {
	const data = await loadFontIntoPage();

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: svgFontsFixture,
			frame: 0,
			inputProps: {},
			svgFonts: [{family: FAMILY, data}],
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'svg-fonts'});
});

test('svgFonts receives the <svg> and is skipped when it holds no text', async () => {
	const seen: SVGSVGElement[] = [];

	await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: svgFontsNoTextFixture,
		frame: 0,
		inputProps: {},
		svgFonts: (svg) => {
			seen.push(svg);
			return null;
		},
	});

	expect(seen).toEqual([]);

	await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: svgFontsFixture,
		frame: 0,
		inputProps: {},
		svgFonts: (svg) => {
			seen.push(svg);
			return null;
		},
	});

	expect(seen).toHaveLength(1);
	expect(seen[0].querySelector('text')?.textContent).toBe('Hamburgefonstiv');
});

test('buildSvgFontFaceCss reads the format from the font itself', async () => {
	const data = await loadFontIntoPage();

	expect(buildSvgFontFaceCss([{family: FAMILY, data}])).toMatch(
		/^@font-face\{font-family:'Bangers';font-style:normal;font-weight:400;src:url\(data:font\/woff2;base64,[A-Za-z0-9+/=]+\) format\('woff2'\);\}$/,
	);
});

test('buildSvgFontFaceCss carries style, weight and unicode-range through', async () => {
	const data = await loadFontIntoPage();

	const css = buildSvgFontFaceCss([
		{
			family: FAMILY,
			data,
			style: 'italic',
			weight: '700',
			unicodeRange: 'U+0000-00FF',
		},
	]);

	expect(css).toContain("font-family:'Bangers'");
	expect(css).toContain('font-style:italic');
	expect(css).toContain('font-weight:700');
	expect(css).toContain('unicode-range:U+0000-00FF');
});

test('buildSvgFontFaceCss rejects bytes it cannot identify', () => {
	expect(() =>
		buildSvgFontFaceCss([
			{family: FAMILY, data: new Uint8Array([1, 2, 3, 4]).buffer},
		]),
	).toThrow(/Pass the "format" field explicitly/);
});

test('embedFontFaceCssInSvgMarkup inserts a style element after the opening tag', () => {
	expect(
		embedFontFaceCssInSvgMarkup({
			svgData: '<svg xmlns="http://www.w3.org/2000/svg"><text>a</text></svg>',
			css: '@font-face{font-family:"A";}',
		}),
	).toBe(
		'<svg xmlns="http://www.w3.org/2000/svg">' +
			'<style type="text/css"><![CDATA[@font-face{font-family:"A";}]]></style>' +
			'<text>a</text></svg>',
	);
});

test('embedFontFaceCssInSvgMarkup leaves a self-closing svg alone', () => {
	expect(
		embedFontFaceCssInSvgMarkup({
			svgData: '<svg xmlns="http://www.w3.org/2000/svg"/>',
			css: '@font-face{font-family:"A";}',
		}),
	).toBe('<svg xmlns="http://www.w3.org/2000/svg"/>');
});
