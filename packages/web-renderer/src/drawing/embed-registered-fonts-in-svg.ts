import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {parseFontFamilies} from './parse-font-families';

type RegisteredFontFace = ReturnType<
	typeof NoReactInternals.getRegisteredFontFaces
>[number];

export type EmbeddedFontStyle = {
	cacheKey: string;
	css: Promise<string>;
};

type EmbeddableFontFace = Omit<RegisteredFontFace, 'fontData' | 'format'> & {
	format: RegisteredFontFace['format'] | null;
	key: string;
	getData: () => Promise<ArrayBuffer>;
};

const base64ByData = new WeakMap<ArrayBuffer, string>();
const ruleByFontFace = new Map<string, Promise<string>>();
const styleByFontFaceSet = new Map<string, EmbeddedFontStyle>();

const getBase64 = (data: ArrayBuffer): string => {
	const cached = base64ByData.get(data);
	if (cached) {
		return cached;
	}

	const bytes = new Uint8Array(data);
	let binary = '';
	for (let offset = 0; offset < bytes.length; offset += 0x8000) {
		binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
	}

	const base64 = btoa(binary);
	base64ByData.set(data, base64);
	return base64;
};

const normalizeFamily = (family: string) =>
	family
		.trim()
		.replace(/^(['"])(.*)\1$/, '$2')
		.toLowerCase();

const normalizeWeight = (value: string): number | null => {
	if (value === 'normal') {
		return 400;
	}

	if (value === 'bold') {
		return 700;
	}

	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
};

const stretchKeywords: Record<string, number> = {
	'ultra-condensed': 50,
	'extra-condensed': 62.5,
	condensed: 75,
	'semi-condensed': 87.5,
	normal: 100,
	'semi-expanded': 112.5,
	expanded: 125,
	'extra-expanded': 150,
	'ultra-expanded': 200,
};

const normalizeStretch = (value: string): number | null => {
	const keyword = stretchKeywords[value];
	if (keyword !== undefined) {
		return keyword;
	}

	if (!value.endsWith('%')) {
		return null;
	}

	const parsed = Number(value.slice(0, -1));
	return Number.isFinite(parsed) ? parsed : null;
};

const valueMatchesRange = ({
	actual,
	descriptor,
	normalize,
}: {
	actual: string;
	descriptor: string;
	normalize: (value: string) => number | null;
}): boolean => {
	const actualValue = normalize(actual);
	const range = descriptor.trim().split(/\s+/).map(normalize);
	if (actualValue === null || range.some((value) => value === null)) {
		return actual.toLowerCase() === descriptor.toLowerCase();
	}

	if (range.length === 1) {
		return actualValue === range[0];
	}

	return (
		range.length === 2 &&
		actualValue >= Math.min(range[0]!, range[1]!) &&
		actualValue <= Math.max(range[0]!, range[1]!)
	);
};

const descriptorsMatch = (
	font: EmbeddableFontFace,
	computedStyle: CSSStyleDeclaration,
): boolean => {
	const fontStyle = font.style ?? 'normal';
	if (
		fontStyle.split(/\s+/)[0]?.toLowerCase() !==
		computedStyle.fontStyle.split(/\s+/)[0]?.toLowerCase()
	) {
		return false;
	}

	if (
		!valueMatchesRange({
			actual: computedStyle.fontWeight,
			descriptor: font.weight ?? '400',
			normalize: normalizeWeight,
		})
	) {
		return false;
	}

	return valueMatchesRange({
		actual: computedStyle.fontStretch || 'normal',
		descriptor: font.stretch ?? 'normal',
		normalize: normalizeStretch,
	});
};

const unicodeRangeSupportsText = (
	unicodeRange: string | null,
	text: string,
): boolean => {
	if (unicodeRange === null) {
		return true;
	}

	const ranges = unicodeRange.split(',').map((range) => {
		const match = /^U\+([0-9A-F?]+)(?:-([0-9A-F]+))?$/i.exec(range.trim());
		if (!match) {
			return null;
		}

		return {
			from: Number.parseInt(match[1]!.replace(/\?/g, '0'), 16),
			to: Number.parseInt((match[2] ?? match[1]!).replace(/\?/g, 'F'), 16),
		};
	});

	if (ranges.some((range) => range === null)) {
		return true;
	}

	return Array.from(text).some((character) => {
		const codePoint = character.codePointAt(0)!;
		return ranges.some(
			(range) =>
				range !== null && codePoint >= range.from && codePoint <= range.to,
		);
	});
};

const mimeTypes = {
	opentype: 'font/otf',
	truetype: 'font/ttf',
	woff: 'font/woff',
	woff2: 'font/woff2',
} as const;

const sniffFontFormat = (data: ArrayBuffer): RegisteredFontFace['format'] => {
	const signature = String.fromCharCode(...new Uint8Array(data).subarray(0, 4));
	if (signature === 'wOF2') return 'woff2';
	if (signature === 'wOFF') return 'woff';
	if (signature === 'OTTO') return 'opentype';
	return 'truetype';
};

const createFontFaceRule = async (font: EmbeddableFontFace) => {
	let data: ArrayBuffer;
	try {
		data = await font.getData();
	} catch (error) {
		// Fonts without CORS headers cannot be read, so the SVG image falls back.
		Internals.Log.warn(
			{logLevel: 'warn', tag: '@remotion/web-renderer'},
			`Could not embed the font ${JSON.stringify(font.fontFamily)} from ${font.fontUrl} into an SVG. SVG text using it will render with a fallback font.`,
			error,
		);
		return '';
	}

	const format = font.format ?? sniffFontFormat(data);
	const declarations = [
		`font-family:${JSON.stringify(font.fontFamily)}`,
		`src:url(data:${mimeTypes[format]};base64,${getBase64(data)}) format(${JSON.stringify(format)})`,
	];
	const optionalDeclarations = [
		['ascent-override', font.ascentOverride],
		['descent-override', font.descentOverride],
		['font-display', font.display],
		['font-feature-settings', font.featureSettings],
		['line-gap-override', font.lineGapOverride],
		['font-stretch', font.stretch],
		['font-style', font.style],
		['font-weight', font.weight],
		['unicode-range', font.unicodeRange],
		['font-variant', font.variant],
	] as const;

	for (const [property, value] of optionalDeclarations) {
		if (value !== null) {
			declarations.push(`${property}:${value}`);
		}
	}

	return `@font-face{${declarations.join(';')}}`;
};

const getFontFaceRule = (font: EmbeddableFontFace) => {
	const cached = ruleByFontFace.get(font.key);
	if (cached) {
		return cached;
	}

	const rule = createFontFaceRule(font);
	ruleByFontFace.set(font.key, rule);
	return rule;
};

const fontSources =
	/url\(\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([^)\s]*))\s*\)(?:\s*format\(\s*["']?([^"')]+)["']?\s*\))?/g;
const embeddableFormats = ['woff2', 'woff', 'truetype', 'opentype'];

const fetchFirstFontSource = async (urls: string[]) => {
	let lastError: unknown = new Error('The @font-face rule has no usable src');
	for (const url of urls) {
		try {
			return await NoReactInternals.fetchFontData(url);
		} catch (error) {
			lastError = error;
		}
	}

	throw lastError;
};

// SVG images cannot load fonts from the document, so @font-face rules are
// re-embedded. Rules apply only while their stylesheet and every enclosing
// @media, @supports and @import condition matches the document.
const getCssFontFaces = (document: Document): EmbeddableFontFace[] => {
	const view = document.defaultView ?? window;
	const faces: EmbeddableFontFace[] = [];

	const readRules = (sheet: CSSStyleSheet): CSSRuleList | null => {
		if (
			sheet.disabled ||
			(sheet.media.mediaText && !view.matchMedia(sheet.media.mediaText).matches)
		) {
			return null;
		}

		try {
			return sheet.cssRules;
		} catch {
			// Cross-origin stylesheets without CORS cannot be read.
			return null;
		}
	};

	const visitRules = (rules: CSSRuleList, baseUrl: string) => {
		for (const rule of rules) {
			if (rule instanceof CSSImportRule) {
				const importedRules = rule.styleSheet && readRules(rule.styleSheet);
				if (importedRules) {
					visitRules(importedRules, rule.styleSheet!.href ?? baseUrl);
				}

				continue;
			}

			if (
				(rule instanceof CSSMediaRule &&
					!view.matchMedia(rule.conditionText).matches) ||
				(rule instanceof CSSSupportsRule && !CSS.supports(rule.conditionText))
			) {
				continue;
			}

			if (!(rule instanceof CSSFontFaceRule)) {
				if ('cssRules' in rule)
					visitRules(rule.cssRules as CSSRuleList, baseUrl);
				continue;
			}

			const get = (property: string) =>
				rule.style.getPropertyValue(property).trim();
			const urls = Array.from(get('src').matchAll(fontSources))
				.filter(
					(match) =>
						match[4] === undefined ||
						embeddableFormats.includes(match[4].trim().toLowerCase()),
				)
				.map(
					(match) =>
						new URL(
							(match[1] ?? match[2] ?? match[3]).replace(/\\(.)/g, '$1'),
							baseUrl,
						).href,
				);
			if (urls.length === 0) {
				continue;
			}

			const orNull = (value: string) => value || null;
			const face = {
				fontFamily: get('font-family').replace(/^(['"])(.*)\1$/, '$2'),
				fontUrl: urls[0],
				style: orNull(get('font-style')),
				weight: orNull(get('font-weight')),
				stretch: orNull(get('font-stretch')),
				unicodeRange: orNull(get('unicode-range')),
				variant: orNull(get('font-variant')),
				featureSettings: orNull(get('font-feature-settings')),
				display: orNull(get('font-display')) as EmbeddableFontFace['display'],
				ascentOverride: orNull(get('ascent-override')),
				descentOverride: orNull(get('descent-override')),
				lineGapOverride: orNull(get('line-gap-override')),
			};
			faces.push({
				...face,
				key: `css:${JSON.stringify({...face, urls})}`,
				format: null,
				getData: () => fetchFirstFontSource(urls),
			});
		}
	};

	for (const sheet of [
		...Array.from(document.styleSheets),
		...document.adoptedStyleSheets,
	]) {
		const rules = readRules(sheet);
		if (rules) {
			visitRules(rules, sheet.href ?? document.baseURI);
		}
	}

	return faces;
};

const fontFaceIds = new WeakMap<FontFace, number>();
let nextFontFaceId = 0;
const cssFontFacesByDocument = new WeakMap<
	Document,
	{signature: string; faces: EmbeddableFontFace[]}
>();

// Walking every stylesheet is slow on large pages. document.fonts holds a
// FontFace for each active @font-face rule: replacing a rule creates a new
// FontFace and editing a descriptor updates its attributes, so reuse the
// last walk while those stay the same.
const getCachedCssFontFaces = (document: Document) => {
	const signature = JSON.stringify([
		document.styleSheets.length,
		document.adoptedStyleSheets.length,
		Array.from(document.fonts, (face) => {
			let id = fontFaceIds.get(face);
			if (id === undefined) {
				id = nextFontFaceId++;
				fontFaceIds.set(face, id);
			}

			return [
				id,
				face.family,
				face.style,
				face.weight,
				face.stretch,
				face.unicodeRange,
				face.featureSettings,
				face.display,
				face.ascentOverride,
				face.descentOverride,
				face.lineGapOverride,
			];
		}),
	]);
	const cached = cssFontFacesByDocument.get(document);
	if (cached?.signature === signature) {
		return cached.faces;
	}

	const faces = getCssFontFaces(document);
	cssFontFacesByDocument.set(document, {signature, faces});
	return faces;
};

export const getEmbeddedFontStyleForSvg = (
	svg: SVGSVGElement,
): EmbeddedFontStyle | null => {
	const textElements = Array.from(
		svg.querySelectorAll('text, foreignObject'),
	).filter((element) => element.namespaceURI === 'http://www.w3.org/2000/svg');
	if (textElements.length === 0) {
		return null;
	}

	const availableFamilies = new Set(
		Array.from(svg.ownerDocument.fonts, (face) => normalizeFamily(face.family)),
	);
	const registeredFonts = NoReactInternals.getRegisteredFontFaces().map(
		(font, index): EmbeddableFontFace => ({
			...font,
			key: `registered:${index}`,
			getData: () => Promise.resolve(font.fontData),
		}),
	);
	// Like document.fonts, CSS-connected faces come first and faces added
	// through the FontFace API (registered fonts) after them.
	let fonts: EmbeddableFontFace[] | null = null;
	const getFamilyFonts = (normalizedFamily: string) => {
		fonts ??= [...getCachedCssFontFaces(svg.ownerDocument), ...registeredFonts];
		return fonts.filter(
			(font) => normalizeFamily(font.fontFamily) === normalizedFamily,
		);
	};

	const usedFonts = new Map<string, EmbeddableFontFace>();
	for (const textElement of textElements) {
		const textNodeWalker = svg.ownerDocument.createTreeWalker(
			textElement,
			NodeFilter.SHOW_TEXT | NodeFilter.SHOW_CDATA_SECTION,
		);
		const computedStyleByElement = new WeakMap<Element, CSSStyleDeclaration>();
		while (textNodeWalker.nextNode()) {
			const text = textNodeWalker.currentNode.textContent ?? '';
			if (text.length === 0) {
				continue;
			}

			const parentElement =
				textNodeWalker.currentNode.parentElement ?? textElement;
			const computedStyle =
				computedStyleByElement.get(parentElement) ??
				(svg.ownerDocument.defaultView ?? window).getComputedStyle(
					parentElement,
				);
			computedStyleByElement.set(parentElement, computedStyle);
			for (const normalizedFamily of parseFontFamilies(
				computedStyle.fontFamily,
			)) {
				if (!availableFamilies.has(normalizedFamily)) continue;
				const familyFonts = getFamilyFonts(normalizedFamily);
				const matchingFonts = familyFonts.filter((font) =>
					descriptorsMatch(font, computedStyle),
				);
				const candidateFonts =
					matchingFonts.length === 0 ? familyFonts : matchingFonts;

				for (const font of candidateFonts) {
					if (unicodeRangeSupportsText(font.unicodeRange, text)) {
						usedFonts.set(font.key, font);
					}
				}
			}
		}
	}

	if (usedFonts.size === 0) {
		return null;
	}

	// Later @font-face rules take precedence, so keep the source order.
	const sortedFonts = fonts!.filter((font) => usedFonts.has(font.key));
	const cacheKey = sortedFonts.map((font) => font.key).join(',');
	const cached = styleByFontFaceSet.get(cacheKey);
	if (cached) {
		return cached;
	}

	const embeddedStyle = {
		cacheKey,
		css: Promise.all(sortedFonts.map(getFontFaceRule)).then((rules) =>
			rules.join(''),
		),
	};
	styleByFontFaceSet.set(cacheKey, embeddedStyle);
	return embeddedStyle;
};

// Reuse an authored CSS stylesheet when carrying font definitions.
export const insertFontStyleInSvg = (
	svg: SVGSVGElement,
	css: string,
	styleIndex: number,
) => {
	// Keep the ordered face snapshot after every retained local font definition.
	const styles = svg.querySelectorAll<SVGStyleElement | HTMLStyleElement>(
		'style',
	);
	let style = styles[styleIndex];
	if (!style) {
		style = svg.ownerDocument.createElementNS(
			'http://www.w3.org/2000/svg',
			'style',
		);
		svg.prepend(style);
	}

	// Carried fonts must not inherit an unrelated authored media restriction.
	const media = style
		.getAttribute('media')
		?.replace(/^[\t\n\f\r ]+|[\t\n\f\r ]+$/g, '');
	if (media && media.toLowerCase() !== 'all') {
		if (!svg.ownerDocument.defaultView!.matchMedia(media).matches) {
			style.textContent = '';
		}

		style.removeAttribute('media');
	}

	// Keep authored @namespace/@import preambles ahead of carried rules.
	style.textContent = (style.textContent ?? '') + '\n' + css;
};
