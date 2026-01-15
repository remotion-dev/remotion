import {
	createCanvasGradient,
	parseLinearGradient,
} from './parse-linear-gradient';

const isColorTransparent = (color: string) => {
	return (
		color === 'transparent' ||
		(color.startsWith('rgba') &&
			(color.endsWith(', 0)') || color.endsWith(',0')))
	);
};

export const getBackgroundFill = ({
	backgroundColor,
	backgroundImage,
	contextToDraw,
	boundingRect,
	offsetLeft,
	offsetTop,
}: {
	backgroundImage: string;
	backgroundColor: string;
	contextToDraw: OffscreenCanvasRenderingContext2D;
	boundingRect: DOMRect;
	offsetLeft: number;
	offsetTop: number;
}): CanvasGradient | string | null => {
	if (backgroundImage && backgroundImage !== 'none') {
		const gradientInfo = parseLinearGradient(backgroundImage);
		if (gradientInfo) {
			const gradient = createCanvasGradient({
				ctx: contextToDraw,
				rect: boundingRect,
				gradientInfo,
				offsetLeft,
				offsetTop,
			});

			return gradient;
		}
	}

	if (
		backgroundColor &&
		backgroundColor !== 'transparent' &&
		!isColorTransparent(backgroundColor)
	) {
		return backgroundColor;
	}

	return null;
};
