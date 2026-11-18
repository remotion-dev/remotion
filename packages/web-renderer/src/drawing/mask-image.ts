import {parseLengthPercentage, splitAtTopLevel} from './background-image-rect';
import type {LinearGradientInfo} from './parse-linear-gradient';
import {parseLinearGradient} from './parse-linear-gradient';

type LinearGradientMaskImageInfo = {
	type: 'linear-gradient';
	gradientInfo: LinearGradientInfo;
};

export type UrlMaskImageInfo = {
	type: 'url';
	src: string;
	maskSize: string;
	maskRepeat: string;
	maskPosition: string;
};

type SingleMaskImageInfo = LinearGradientMaskImageInfo | UrlMaskImageInfo;
type MaskLayerStyle = Pick<
	CSSStyleDeclaration,
	| 'maskComposite'
	| 'maskSize'
	| 'maskPosition'
	| 'maskRepeat'
	| 'maskOrigin'
	| 'maskClip'
	| 'maskMode'
>;
export type MaskImageInfo =
	| SingleMaskImageInfo
	| {
			type: 'layers';
			layers: (UrlMaskImageInfo | null)[];
			style: MaskLayerStyle;
	  };

export const getMaskImageValue = (
	computedStyle: CSSStyleDeclaration,
): string | null => {
	// Check both standard and webkit-prefixed properties
	const {maskImage, webkitMaskImage} = computedStyle;

	const value = maskImage || webkitMaskImage;

	if (!value || value === 'none') {
		return null;
	}

	return value;
};

export const parseUrlFunction = (value: string): string | null => {
	const trimmed = value.trim();
	if (!trimmed.toLowerCase().startsWith('url(')) {
		return null;
	}

	let index = 4;
	while (/\s/.test(trimmed[index] ?? '')) {
		index++;
	}

	const quote =
		trimmed[index] === '"' || trimmed[index] === "'" ? trimmed[index] : null;
	if (quote) {
		index++;
	}

	let url = '';
	let closedQuote = quote === null;
	for (; index < trimmed.length; index++) {
		const char = trimmed[index];
		if (char === '\\') {
			const next = trimmed[index + 1];
			if (next === undefined) {
				return null;
			}

			url += next;
			index++;
			continue;
		}

		if (quote && char === quote) {
			closedQuote = true;
			index++;
			break;
		}

		if (!quote && char === ')') {
			break;
		}

		url += char;
	}

	if (!closedQuote) {
		return null;
	}

	while (/\s/.test(trimmed[index] ?? '')) {
		index++;
	}

	if (trimmed[index] !== ')') {
		return null;
	}

	index++;
	while (/\s/.test(trimmed[index] ?? '')) {
		index++;
	}

	if (index !== trimmed.length) {
		return null;
	}

	return url.trim();
};

const getMaskProperty = ({
	standard,
	prefixed,
	layer,
}: {
	standard: string;
	prefixed: string;
	layer: number;
}) => {
	const values = splitAtTopLevel(standard || prefixed, ',');
	return values[layer % values.length];
};

const normalizeCssValue = (value: string) =>
	value.trim().toLowerCase().replace(/\s+/g, ' ');

const validateUrlMaskImageStyle = (
	computedStyle: CSSStyleDeclaration,
	layer: number,
) => {
	const maskSize = normalizeCssValue(
		getMaskProperty({
			standard: computedStyle.maskSize,
			prefixed: computedStyle.webkitMaskSize,
			layer,
		}),
	);
	const maskPosition = normalizeCssValue(
		getMaskProperty({
			standard: computedStyle.maskPosition,
			prefixed: computedStyle.webkitMaskPosition,
			layer,
		}),
	);
	const maskRepeat = normalizeCssValue(
		getMaskProperty({
			standard: computedStyle.maskRepeat,
			prefixed: computedStyle.webkitMaskRepeat,
			layer,
		}),
	);
	const maskMode = normalizeCssValue(
		getMaskProperty({standard: computedStyle.maskMode, prefixed: '', layer}),
	);
	const maskOrigin = normalizeCssValue(
		getMaskProperty({
			standard: computedStyle.maskOrigin,
			prefixed: computedStyle.webkitMaskOrigin,
			layer,
		}),
	);
	const maskClip = normalizeCssValue(
		getMaskProperty({
			standard: computedStyle.maskClip,
			prefixed: computedStyle.webkitMaskClip,
			layer,
		}),
	);

	const positionParts = splitAtTopLevel(maskPosition, ' ');
	const isSupportedPosition =
		positionParts.length === 2 &&
		positionParts.every(
			(value) =>
				['left', 'right', 'top', 'bottom', 'center'].includes(value) ||
				parseLengthPercentage(value) !== null ||
				/^(calc|min|max|clamp)\(/.test(value),
		);
	const sizeParts = splitAtTopLevel(maskSize, ' ');
	const isSupportedSize =
		['contain', 'cover'].includes(maskSize) ||
		(sizeParts.length <= 2 &&
			sizeParts.every(
				(value) =>
					value === 'auto' ||
					value.includes('(') ||
					(parseLengthPercentage(value)?.value ?? -1) >= 0,
			));
	const unsupportedProperties = [
		!isSupportedSize ? `mask-size: ${maskSize}` : null,
		!isSupportedPosition ? `mask-position: ${maskPosition}` : null,
		![
			'repeat',
			'no-repeat',
			'repeat-x',
			'repeat-y',
			'repeat no-repeat',
			'no-repeat repeat',
			'repeat repeat',
			'no-repeat no-repeat',
		].includes(maskRepeat)
			? `mask-repeat: ${maskRepeat}`
			: null,
		maskMode !== '' && maskMode !== 'alpha' && maskMode !== 'match-source'
			? `mask-mode: ${maskMode}`
			: null,
		maskOrigin !== 'border-box' ? `mask-origin: ${maskOrigin}` : null,
		maskClip !== 'border-box' ? `mask-clip: ${maskClip}` : null,
	].filter((property): property is string => property !== null);

	if (unsupportedProperties.length > 0) {
		throw new Error(
			'@remotion/web-renderer only supports URL masks with pixel/percentage/CSS-math/auto/contain/cover sizing, repeat/no-repeat tiling, pixel/percentage/CSS-math mask positioning, the border box as origin and clip, and alpha semantics. ' +
				`Unsupported value${unsupportedProperties.length === 1 ? '' : 's'}: ${unsupportedProperties.join(', ')}`,
		);
	}

	return {maskSize, maskRepeat, maskPosition};
};

const parseSingleMaskImage = (
	maskImageValue: string,
	computedStyle: CSSStyleDeclaration,
	layer: number,
): SingleMaskImageInfo => {
	const url = parseUrlFunction(maskImageValue);
	if (url !== null) {
		if (!url) {
			throw new Error('mask-image: url() must contain a URL');
		}

		return {
			type: 'url',
			src: new URL(url, document.baseURI).href,
			...validateUrlMaskImageStyle(computedStyle, layer),
		};
	}

	const gradientInfo = /^\s*linear-gradient\(/i.test(maskImageValue)
		? parseLinearGradient(maskImageValue)
		: null;
	if (gradientInfo) {
		return {type: 'linear-gradient', gradientInfo};
	}

	if (maskImageValue.trim().toLowerCase().startsWith('url(')) {
		throw new Error(
			'@remotion/web-renderer only supports a single mask-image: url() layer',
		);
	}

	throw new Error(`Unsupported mask-image layer: ${maskImageValue}`);
};

export const parseMaskImage = (
	value: string,
	computedStyle: CSSStyleDeclaration,
): MaskImageInfo | null => {
	const images = splitAtTopLevel(value, ',');
	if (images.length === 1) return parseSingleMaskImage(value, computedStyle, 0);
	if (!CSS.supports('mask-composite', computedStyle.maskComposite)) {
		throw new Error(
			`Unsupported mask-composite value: ${computedStyle.maskComposite}. Use add, subtract, intersect, or exclude.`,
		);
	}

	return {
		type: 'layers',
		style: {
			maskComposite: computedStyle.maskComposite,
			maskSize: computedStyle.maskSize,
			maskPosition: computedStyle.maskPosition,
			maskRepeat: computedStyle.maskRepeat,
			maskOrigin: computedStyle.maskOrigin,
			maskClip: computedStyle.maskClip,
			maskMode: computedStyle.maskMode,
		},
		layers: images.map((image, index) => {
			if (image === 'none') return null;
			const parsed = parseSingleMaskImage(image, computedStyle, index);
			if (parsed.type !== 'url')
				throw new Error(
					'Multiple mask-image layers require raster URL or none sources',
				);
			return parsed;
		}),
	};
};

const elementHasUrlMaskImage = (element: Element) => {
	const value = getMaskImageValue(getComputedStyle(element));
	return value
		? splitAtTopLevel(value, ',').some((layer) =>
				layer.toLowerCase().startsWith('url('),
			)
		: false;
};

export const containsUrlMaskImage = (element: HTMLElement) => {
	if (elementHasUrlMaskImage(element)) {
		return true;
	}

	const children = element.querySelectorAll('*');
	for (let index = 0; index < children.length; index++) {
		const child = children[index];
		if (elementHasUrlMaskImage(child)) {
			return true;
		}
	}

	return false;
};
