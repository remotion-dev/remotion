import type {LinearGradientInfo} from './parse-linear-gradient';
import {parseLinearGradient} from './parse-linear-gradient';

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

export const parseMaskImage = (
	maskImageValue: string,
): LinearGradientInfo | null => {
	// Only linear gradients are supported for now
	return parseLinearGradient(maskImageValue);
};
