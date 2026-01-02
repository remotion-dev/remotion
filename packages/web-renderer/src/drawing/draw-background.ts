import {
	createCanvasGradient,
	parseLinearGradient,
} from './parse-linear-gradient';

export const drawBackground = ({
	backgroundImage,
	context,
	rect,
	backgroundColor,
	backgroundClipText,
}: {
	backgroundImage: string;
	context: OffscreenCanvasRenderingContext2D;
	rect: DOMRect;
	backgroundColor: string;
	backgroundClipText: boolean;
}) => {
	if (backgroundClipText) {
		context.globalCompositeOperation = 'source-in';
		return;
	}

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
		backgroundColor &&
		backgroundColor !== 'transparent' &&
		!(
			backgroundColor.startsWith('rgba') &&
			(backgroundColor.endsWith(', 0)') || backgroundColor.endsWith(',0'))
		)
	) {
		const originalFillStyle = context.fillStyle;
		context.fillStyle = backgroundColor;
		context.fillRect(rect.left, rect.top, rect.width, rect.height);
		context.fillStyle = originalFillStyle;
	}
};
