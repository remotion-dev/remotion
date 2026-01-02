import {
	createCanvasGradient,
	parseLinearGradient,
} from './parse-linear-gradient';

export const drawBackground = ({
	backgroundImage,
	context,
	rect,
	background,
}: {
	backgroundImage: string;
	context: OffscreenCanvasRenderingContext2D;
	rect: DOMRect;
	background: string;
}) => {
	if (backgroundImage && backgroundImage !== 'none') {
		const gradientInfo = parseLinearGradient(backgroundImage);
		if (gradientInfo) {
			const gradient = createCanvasGradient({
				ctx: context,
				rect,
				gradientInfo,
			});
			const originalFillStyle = context.fillStyle;
			context.fillStyle = gradient;
			context.fillRect(rect.left, rect.top, rect.width, rect.height);
			context.fillStyle = originalFillStyle;
			return;
		}
	}

	// Fallback to solid background color if no gradient was drawn
	if (
		background &&
		background !== 'transparent' &&
		!(
			background.startsWith('rgba') &&
			(background.endsWith(', 0)') || background.endsWith(',0'))
		)
	) {
		const originalFillStyle = context.fillStyle;
		context.fillStyle = background;
		context.fillRect(rect.left, rect.top, rect.width, rect.height);
		context.fillStyle = originalFillStyle;
	}
};
