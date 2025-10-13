import {TextTransform, measureText} from '@remotion/layout-utils';

export interface CornerRounding {
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

	return lines.map((_, i) => {
		const currLen = lengths[i];

		const roundings: CornerRounding = {
			align,
			width: currLen.width,
			height: currLen.height,
		};

		return roundings;
	});
};
