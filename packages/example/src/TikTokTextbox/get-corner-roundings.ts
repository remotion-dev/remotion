import {TextTransform, measureText} from '@remotion/layout-utils';

export interface CornerRounding {
	topLeft: boolean;
	topRight: boolean;
	bottomLeft: boolean;
	bottomRight: boolean;
	cornerTopLeft: boolean;
	cornerTopRight: boolean;
	cornerBottomLeft: boolean;
	cornerBottomRight: boolean;
	cornerLeft: boolean;
	cornerRight: boolean;
	widthDifferenceToPrevious: number | undefined;
	widthDifferenceToNext: number | undefined;
	align: React.CSSProperties['textAlign'];
	width: number;
	height: number;
}

export const getCornerRoundings = ({
	lines,
	fontFamily,
	fontSize,
	additionalStyles,
	fontVariantNumeric,
	fontWeight,
	letterSpacing,
	textTransform,
	align,
}: {
	lines: string[];
	fontFamily: string;
	fontSize: number;
	additionalStyles: React.CSSProperties;
	fontVariantNumeric: string;
	fontWeight: number;
	letterSpacing: string;
	textTransform: TextTransform;
	align: React.CSSProperties['textAlign'];
}): CornerRounding[] => {
	const lengths = lines.map((line) =>
		measureText({
			text: line,
			fontFamily,
			fontSize,
			additionalStyles,
			fontVariantNumeric,
			fontWeight,
			letterSpacing,
			textTransform,
			validateFontIsLoaded: true,
		}),
	);
	const n = lengths.length;

	return lines.map((_, i) => {
		const isFirst = i === 0;
		const isLast = i === n - 1;
		const prevLen = i > 0 ? lengths[i - 1] : undefined;
		const nextLen = i < n - 1 ? lengths[i + 1] : undefined;
		const currLen = lengths[i];

		const widthDifferenceToPrevious =
			prevLen !== undefined ? currLen.width - prevLen.width : undefined;
		const widthDifferenceToNext =
			nextLen !== undefined ? currLen.width - nextLen.width : undefined;

		// Determine rounded corners
		let topLeft =
			prevLen === undefined ||
			(currLen.width - 0 > prevLen.width && align !== 'left');
		let topRight =
			prevLen === undefined ||
			(currLen.width - 0 > prevLen.width && align !== 'right');
		let bottomLeft =
			nextLen === undefined ||
			(currLen.width - 0 > nextLen.width && align !== 'left');
		let bottomRight =
			nextLen === undefined ||
			(currLen.width - 0 > nextLen.width && align !== 'right');

		if (!isFirst && !isLast) {
			if (align === 'left') {
				topLeft = bottomLeft = false;
			} else if (align === 'right') {
				topRight = bottomRight = false;
			}
		}

		// Determine corner properties
		let cornerTopLeft = false;
		let cornerTopRight = false;
		let cornerBottomLeft = false;
		let cornerBottomRight = false;
		const cornerLeft = false;
		const cornerRight = false;

		if (align === 'left') {
			cornerBottomRight = !bottomRight;
			cornerTopRight = !topRight;
		} else if (align === 'right') {
			cornerBottomLeft = !bottomLeft;
			cornerTopLeft = !topLeft;
		} else if (align === 'center') {
			// LEFT side

			cornerTopLeft = !topLeft;
			cornerBottomLeft = !bottomLeft;
			// RIGHT side

			cornerTopRight = !topRight;
			cornerBottomRight = !bottomRight;
		}

		const roundings: CornerRounding = {
			topLeft,
			topRight,
			bottomLeft,
			bottomRight,
			cornerTopLeft,
			cornerTopRight,
			cornerBottomLeft,
			cornerBottomRight,
			cornerLeft,
			cornerRight,
			align,
			widthDifferenceToPrevious,
			widthDifferenceToNext,
			width: currLen.width,
			height: currLen.height,
		};

		return roundings;
	});
};
