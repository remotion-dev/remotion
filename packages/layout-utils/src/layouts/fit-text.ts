import type {
	ModifyableCSSProperties,
	TextTransform,
} from '../layouts/measure-text';
import {measureText} from '../layouts/measure-text';

const sampleSize = 100;
/**
 * @description Calculates the font size needed to fit text into a specified width container.
 * @see [Documentation](https://remotion.dev/docs/layout-utils/fit-text)
 * @param {Object} params - The parameters containing details to fit text.
 * @param {string} params.text - The text content to fit.
 * @param {number} params.withinWidth - The container width to fit the text into.
 * @param {string} params.fontFamily - The font family to apply to the text.
 * @param {string|number} [params.fontWeight] - The font weight to apply (optional).
 * @param {string} [params.letterSpacing] - The spacing between letters (optional).
 * @param {string} [params.fontVariantNumeric] - The numeric font variant to apply (optional).
 * @param {boolean} [params.validateFontIsLoaded] - Validate if the font is loaded before rendering text (optional).
 * @param {TextTransform} [params.textTransform] - Text transformation to apply (uppercase, lowercase) (optional).
 * @param {ModifyableCSSProperties} [params.additionalStyles] - Additional CSS properties affecting text layout (optional).
 * @returns {Object} An object containing the computed `fontSize` to use for the specified width.
 */
export const fitText = ({
	text,
	withinWidth,
	fontFamily,
	fontVariantNumeric,
	fontWeight,
	letterSpacing,
	validateFontIsLoaded,
	additionalStyles,
	textTransform,
}: {
	text: string;
	withinWidth: number;
	fontFamily: string;
	fontWeight?: number | string;
	letterSpacing?: string;
	fontVariantNumeric?: string;
	validateFontIsLoaded?: boolean;
	textTransform?: TextTransform;
	additionalStyles?: ModifyableCSSProperties;
}) => {
	const estimate = measureText({
		text,
		fontFamily,
		fontSize: sampleSize,
		fontWeight,
		fontVariantNumeric,
		letterSpacing,
		validateFontIsLoaded,
		textTransform,
		additionalStyles,
	});

	return {fontSize: (withinWidth / estimate.width) * sampleSize};
};
