import {NoReactInternals} from 'remotion/no-react';

type RegisteredFontFace = ReturnType<
	typeof NoReactInternals.getRegisteredFontFaces
>[number];

export type EmbeddedFontStyle = {
	blob: Blob;
	cacheKey: string;
	css: string;
};

const base64ByData = new WeakMap<ArrayBuffer, string>();
const ruleByFontFace = new WeakMap<RegisteredFontFace, string>();
const styleByFontFaceSet = new Map<string, EmbeddedFontStyle>();
const fontIndexesByFamily = new Map<string, number[]>();
let indexedFontCount = 0;

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
	font: RegisteredFontFace,
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

const getFontFaceRule = (font: RegisteredFontFace): string => {
	const cached = ruleByFontFace.get(font);
	if (cached) {
		return cached;
	}

	const mimeTypes = {
		opentype: 'font/otf',
		truetype: 'font/ttf',
		woff: 'font/woff',
		woff2: 'font/woff2',
	} as const;
	const declarations = [
		`font-family:${JSON.stringify(font.fontFamily)}`,
		`src:url(data:${mimeTypes[font.format]};base64,${getBase64(font.fontData)}) format(${JSON.stringify(font.format)})`,
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

	const rule = `@font-face{${declarations.join(';')}}`;
	ruleByFontFace.set(font, rule);
	return rule;
};

export const getEmbeddedFontStyleForSvg = (
	svg: SVGSVGElement,
): EmbeddedFontStyle | null => {
	const textElements = svg.querySelectorAll('text');
	if (textElements.length === 0) {
		return null;
	}

	const registeredFonts = NoReactInternals.getRegisteredFontFaces();
	for (let index = indexedFontCount; index < registeredFonts.length; index++) {
		const family = registeredFonts[index]!.fontFamily.toLowerCase();
		const indexes = fontIndexesByFamily.get(family) ?? [];
		indexes.push(index);
		fontIndexesByFamily.set(family, indexes);
	}

	indexedFontCount = registeredFonts.length;

	const usedFontIndexes = new Set<number>();
	for (const textElement of textElements) {
		const textNodeWalker = svg.ownerDocument.createTreeWalker(textElement, 4);
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
			for (const family of computedStyle.fontFamily.split(',')) {
				const normalizedFamily = family
					.trim()
					.replace(/^(['"])(.*)\1$/, '$2')
					.toLowerCase();
				const familyIndexes = fontIndexesByFamily.get(normalizedFamily) ?? [];
				const matchingIndexes = familyIndexes.filter((index) =>
					descriptorsMatch(registeredFonts[index]!, computedStyle),
				);
				const candidateIndexes =
					matchingIndexes.length === 0 ? familyIndexes : matchingIndexes;

				for (const index of candidateIndexes) {
					if (
						unicodeRangeSupportsText(registeredFonts[index]!.unicodeRange, text)
					) {
						usedFontIndexes.add(index);
					}
				}
			}
		}
	}

	if (usedFontIndexes.size === 0) {
		return null;
	}

	const sortedIndexes = Array.from(usedFontIndexes).sort((a, b) => a - b);
	const cacheKey = sortedIndexes.join(',');
	const cached = styleByFontFaceSet.get(cacheKey);
	if (cached) {
		return cached;
	}

	const css = sortedIndexes
		.map((index) => getFontFaceRule(registeredFonts[index]!))
		.join('')
		.replace(/]]>/g, ']]]]><![CDATA[>');
	const style = `<style type="text/css"><![CDATA[${css}]]></style>`;
	const embeddedStyle = {
		blob: new Blob([style]),
		cacheKey,
		css,
	};
	styleByFontFaceSet.set(cacheKey, embeddedStyle);
	return embeddedStyle;
};
