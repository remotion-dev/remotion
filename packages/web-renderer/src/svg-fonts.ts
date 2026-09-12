/**
 * An <svg> is rasterized by serializing it and loading it through an <img>.
 * An SVG loaded as an image is an isolated document, so it cannot reach the
 * page's fonts and its <text> falls back to a system face. The one thing it can
 * read is a `data:` URL it carries itself, so the font has to travel inside the
 * markup.
 *
 * The bytes cannot be recovered by the renderer: a `FontFace` added through the
 * CSS Font Loading API never exposes its `src`, and a cross-origin stylesheet's
 * rules cannot be read. So the caller supplies them.
 */
export type SvgFontFormat = 'opentype' | 'truetype' | 'woff' | 'woff2';

export type SvgFont = {
	family: string;
	data: ArrayBuffer;
	format?: SvgFontFormat;
	style?: string;
	unicodeRange?: string;
	weight?: string;
};

export type SvgFonts =
	| SvgFont[]
	| ((svg: SVGSVGElement) => Promise<SvgFont[] | null> | SvgFont[] | null);

// A font is re-embedded on every frame, so the encoding is cached per buffer.
const base64ByData = new WeakMap<ArrayBuffer, string>();

const FORMAT_MIME: Record<SvgFontFormat, string> = {
	opentype: 'font/otf',
	truetype: 'font/ttf',
	woff: 'font/woff',
	woff2: 'font/woff2',
};

const toBase64 = (data: ArrayBuffer): string => {
	const cached = base64ByData.get(data);
	if (cached) {
		return cached;
	}

	const bytes = new Uint8Array(data);
	let binary = '';
	for (let offset = 0; offset < bytes.length; offset += 0x8000) {
		binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
	}

	const encoded = btoa(binary);
	base64ByData.set(data, encoded);

	return encoded;
};

// There is no filename to read an extension from, unlike getFontFormat().
const sniffFontFormat = (data: ArrayBuffer): SvgFontFormat => {
	const tag = new Uint8Array(data, 0, Math.min(4, data.byteLength));
	const signature = String.fromCharCode(...tag);

	if (signature === 'wOF2') {
		return 'woff2';
	}

	if (signature === 'wOFF') {
		return 'woff';
	}

	if (signature === 'OTTO') {
		return 'opentype';
	}

	if (signature === 'true' || signature === 'ttcf') {
		return 'truetype';
	}

	if (
		tag[0] === 0x00 &&
		tag[1] === 0x01 &&
		tag[2] === 0x00 &&
		tag[3] === 0x00
	) {
		return 'truetype';
	}

	throw new Error(
		'Could not determine the format of a font passed to svgFonts. Pass the "format" field explicitly.',
	);
};

const fontToFontFaceRule = (font: SvgFont): string => {
	const format = font.format ?? sniffFontFormat(font.data);
	const declarations = [
		`font-family:'${font.family.replace(/['\\]/g, '\\$&')}'`,
		`font-style:${font.style ?? 'normal'}`,
		`font-weight:${font.weight ?? '400'}`,
	];

	if (font.unicodeRange) {
		declarations.push(`unicode-range:${font.unicodeRange}`);
	}

	declarations.push(
		`src:url(data:${FORMAT_MIME[format]};base64,${toBase64(font.data)}) format('${format}')`,
	);

	return `@font-face{${declarations.join(';')};}`;
};

export const resolveSvgFonts = async ({
	svg,
	svgFonts,
}: {
	svg: SVGSVGElement;
	svgFonts: SvgFonts | null;
}): Promise<SvgFont[] | null> => {
	if (svgFonts === null) {
		return null;
	}

	if (!svg.querySelector('text, tspan, textPath')) {
		return null;
	}

	const fonts = typeof svgFonts === 'function' ? await svgFonts(svg) : svgFonts;

	if (!fonts || fonts.length === 0) {
		return null;
	}

	return fonts;
};

export const buildSvgFontFaceCss = (fonts: SvgFont[]): string => {
	return fonts.map(fontToFontFaceRule).join('');
};

export const embedFontFaceCssInSvgMarkup = ({
	svgData,
	css,
}: {
	svgData: string;
	css: string;
}): string => {
	const openingTagEnd = svgData.indexOf('>');

	if (openingTagEnd === -1 || svgData[openingTagEnd - 1] === '/') {
		return svgData;
	}

	const escaped = css.replace(/]]>/g, ']]]]><![CDATA[>');
	const style = `<style type="text/css"><![CDATA[${escaped}]]></style>`;

	return (
		svgData.slice(0, openingTagEnd + 1) +
		style +
		svgData.slice(openingTagEnd + 1)
	);
};
