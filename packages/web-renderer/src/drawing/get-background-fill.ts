import {getBackgroundImageRect} from './background-image-rect';
import {
	createCanvasGradient,
	parseRadialGradient,
	createRadialGradientFill,
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
	backgroundPosition,
	backgroundSize,
	contextToDraw,
	boundingRect,
	offsetLeft,
	offsetTop,
}: {
	backgroundImage: string;
	backgroundPosition: string;
	backgroundSize: string;
	backgroundColor: string;
	contextToDraw: OffscreenCanvasRenderingContext2D;
	boundingRect: DOMRect;
	offsetLeft: number;
	offsetTop: number;
}): CanvasGradient | CanvasPattern | string | null => {
	if (backgroundImage && backgroundImage !== 'none') {
		const radialGradientInfo = parseRadialGradient(backgroundImage);
		if (radialGradientInfo) {
			const rect = getBackgroundImageRect({
				backgroundPosition,
				backgroundSize,
				positioningArea: boundingRect,
			});
			return createRadialGradientFill({
				gradientInfo: radialGradientInfo,
				contextToDraw,
				rect,
				offsetLeft,
				offsetTop,
			});
		}

		const gradientInfo = parseLinearGradient(backgroundImage);
		if (gradientInfo) {
			const backgroundImageRect = getBackgroundImageRect({
				backgroundPosition,
				backgroundSize,
				positioningArea: boundingRect,
			});
			const gradient = createCanvasGradient({
				ctx: contextToDraw,
				rect: backgroundImageRect,
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
