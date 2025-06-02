import {fillTextBox} from './fill-text-box';
import type {TextTransform} from './measure-text';

const PRECISION = 100;

type FitTextOnNLinesProps = {
	text: string;
	maxLines: number;
	maxBoxWidth: number;
	fontFamily: string;
	fontWeight?: number | string;
	letterSpacing?: string;
	fontVariantNumeric?: string;
	validateFontIsLoaded?: boolean;
	textTransform?: TextTransform;
	additionalStyles?: Record<string, string>;
};

export const fitTextOnNLines = ({
	text,
	maxLines,
	maxBoxWidth,
	fontFamily,
	fontWeight,
	letterSpacing,
	fontVariantNumeric,
	validateFontIsLoaded,
	textTransform,
	additionalStyles,
}: FitTextOnNLinesProps) => {
	// Fixed max font size since we are using binary search a
	const maxFontSize = 2000;
	const minFontSize = 0.1;

	// Binary search to find the optimal font size
	let left = Math.floor(minFontSize * PRECISION);
	let right = Math.floor(maxFontSize * PRECISION);
	let optimalFontSize = minFontSize;
	while (left <= right) {
		const mid = Math.floor((left + right) / 2);
		const fontSize = mid / PRECISION;

		// Create a text box with current font size
		const textBox = fillTextBox({
			maxBoxWidth,
			maxLines,
		});

		// Split text into words and try to fit them
		const words = text.split(' ');
		let exceedsBox = false;
		let currentLine = 0;

		for (const word of words) {
			const result = textBox.add({
				text: word + ' ',
				fontFamily,
				fontWeight,
				fontSize,
				letterSpacing,
				fontVariantNumeric,
				validateFontIsLoaded,
				textTransform,
				additionalStyles,
			});

			if (result.exceedsBox) {
				exceedsBox = true;
				break;
			}

			if (result.newLine) {
				currentLine++;
			}
		}

		// If text fits within the box and number of lines
		if (!exceedsBox && currentLine < maxLines) {
			optimalFontSize = fontSize;
			left = mid + 1;
		} else {
			right = mid - 1;
		}
	}

	return {
		fontSize: optimalFontSize,
	};
};
