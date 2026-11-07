import {NoReactInternals} from 'remotion/no-react';
import type {
	ModifyableCSSProperties,
	TextTransform,
} from '../layouts/measure-text';
import {measureText} from '../layouts/measure-text';

const sampleSize = 100;
/*
 * @description Calculates the font size needed to fit text into a specified width container.
 * @see [Documentation](https://remotion.dev/docs/layout-utils/fit-text)
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

	if (NoReactInternals.ENABLE_V5_BREAKING_CHANGES && estimate.width === 0) {
		throw new Error(
			`The width of the text ${JSON.stringify(
				text,
			)} is 0, therefore a font size cannot be calculated. Pass a text with a width greater than 0.`,
		);
	}

	return {fontSize: (withinWidth / estimate.width) * sampleSize};
};
