import type {LinearGradientInfo} from './parse-linear-gradient';
import {parseLinearGradient} from './parse-linear-gradient';

type LinearGradientMaskImageInfo = {
	type: 'linear-gradient';
	gradientInfo: LinearGradientInfo;
};

export type UrlMaskImageInfo = {
	type: 'url';
	src: string;
};

export type MaskImageInfo = LinearGradientMaskImageInfo | UrlMaskImageInfo;

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

const parseUrlFunction = (value: string): string | null => {
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
}: {
	standard: string;
	prefixed: string;
}) => standard || prefixed;

const normalizeCssValue = (value: string) =>
	value.trim().toLowerCase().replace(/\s+/g, ' ');

export const validateUrlMaskImageStyle = (
	computedStyle: CSSStyleDeclaration,
) => {
	const maskSize = normalizeCssValue(
		getMaskProperty({
			standard: computedStyle.maskSize,
			prefixed: computedStyle.webkitMaskSize,
		}),
	);
	const maskPosition = normalizeCssValue(
		getMaskProperty({
			standard: computedStyle.maskPosition,
			prefixed: computedStyle.webkitMaskPosition,
		}),
	);
	const maskRepeat = normalizeCssValue(
		getMaskProperty({
			standard: computedStyle.maskRepeat,
			prefixed: computedStyle.webkitMaskRepeat,
		}),
	);
	const maskMode = normalizeCssValue(computedStyle.maskMode);
	const maskOrigin = normalizeCssValue(
		getMaskProperty({
			standard: computedStyle.maskOrigin,
			prefixed: computedStyle.webkitMaskOrigin,
		}),
	);
	const maskClip = normalizeCssValue(
		getMaskProperty({
			standard: computedStyle.maskClip,
			prefixed: computedStyle.webkitMaskClip,
		}),
	);

	const isSupportedPosition =
		maskPosition === '0% 0%' ||
		maskPosition === '0px 0px' ||
		maskPosition === 'left top';
	const unsupportedProperties = [
		maskSize !== '100% 100%' ? `mask-size: ${maskSize}` : null,
		!isSupportedPosition ? `mask-position: ${maskPosition}` : null,
		maskRepeat !== 'no-repeat' ? `mask-repeat: ${maskRepeat}` : null,
		maskMode !== '' && maskMode !== 'alpha' && maskMode !== 'match-source'
			? `mask-mode: ${maskMode}`
			: null,
		maskOrigin !== 'border-box' ? `mask-origin: ${maskOrigin}` : null,
		maskClip !== 'border-box' ? `mask-clip: ${maskClip}` : null,
	].filter((property): property is string => property !== null);

	if (unsupportedProperties.length > 0) {
		throw new Error(
			'@remotion/web-renderer only supports URL masks with mask-size: 100% 100%, mask-position: 0% 0%, mask-repeat: no-repeat, the border box as origin and clip, and alpha semantics. ' +
				`Unsupported value${unsupportedProperties.length === 1 ? '' : 's'}: ${unsupportedProperties.join(', ')}`,
		);
	}
};

export const parseMaskImage = (
	maskImageValue: string,
): MaskImageInfo | null => {
	const gradientInfo = parseLinearGradient(maskImageValue);
	if (gradientInfo) {
		return {type: 'linear-gradient', gradientInfo};
	}

	const url = parseUrlFunction(maskImageValue);
	if (url !== null) {
		if (!url) {
			throw new Error('mask-image: url() must contain a URL');
		}

		return {type: 'url', src: new URL(url, document.baseURI).href};
	}

	if (maskImageValue.trim().toLowerCase().startsWith('url(')) {
		throw new Error(
			'@remotion/web-renderer only supports a single mask-image: url() layer',
		);
	}

	return null;
};

const elementHasUrlMaskImage = (element: Element) => {
	const value = getMaskImageValue(getComputedStyle(element));
	return value?.trim().toLowerCase().startsWith('url(') ?? false;
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
