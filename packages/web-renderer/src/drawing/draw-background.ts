import type {LogLevel} from 'remotion';
import type {InternalState} from '../internal-state';
import {getClippedBackground} from './get-clipped-background';
import {getBoxBasedOnBackgroundClip} from './get-padding-box';
import {
	createCanvasGradient,
	parseLinearGradient,
} from './parse-linear-gradient';

export const drawBackground = async ({
	backgroundImage,
	context,
	rect,
	backgroundColor,
	backgroundClip,
	element,
	logLevel,
	internalState,
	computedStyle,
}: {
	backgroundImage: string;
	context: OffscreenCanvasRenderingContext2D;
	rect: DOMRect;
	backgroundColor: string;
	backgroundClip: string;
	element: HTMLElement | SVGElement;
	logLevel: LogLevel;
	internalState: InternalState;
	computedStyle: CSSStyleDeclaration;
}) => {
	let contextToDraw = context;

	const originalCompositeOperation = context.globalCompositeOperation;
	let offsetLeft = 0;
	let offsetTop = 0;

	const finish = () => {
		context.globalCompositeOperation = originalCompositeOperation;
		if (context !== contextToDraw) {
			context.drawImage(
				contextToDraw.canvas,
				offsetLeft,
				offsetTop,
				contextToDraw.canvas.width,
				contextToDraw.canvas.height,
			);
		}
	};

	const boundingRects = getBoxBasedOnBackgroundClip(
		rect,
		computedStyle,
		backgroundClip,
	);

	console.log(boundingRects);

	for (const boundingRect of boundingRects) {
		if (backgroundClip.includes('text')) {
			offsetLeft = boundingRect.left;
			offsetTop = boundingRect.top;
			const originalBackgroundClip = element.style.backgroundClip;
			const originalWebkitBackgroundClip = element.style.webkitBackgroundClip;
			element.style.backgroundClip = 'initial';
			element.style.webkitBackgroundClip = 'initial';
			const drawn = await getClippedBackground({
				element,
				boundingRect,
				logLevel,
				internalState,
			});
			element.style.backgroundClip = originalBackgroundClip;
			element.style.webkitBackgroundClip = originalWebkitBackgroundClip;
			contextToDraw = drawn;
			contextToDraw.globalCompositeOperation = 'source-in';
		}

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
				const originalFillStyle = contextToDraw.fillStyle;
				contextToDraw.fillStyle = gradient;
				contextToDraw.fillRect(
					boundingRect.left - offsetLeft,
					boundingRect.top - offsetTop,
					boundingRect.width,
					boundingRect.height,
				);
				contextToDraw.fillStyle = originalFillStyle;
				return finish();
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
			const originalFillStyle = contextToDraw.fillStyle;
			contextToDraw.fillStyle = backgroundColor;
			contextToDraw.fillRect(
				boundingRect.left - offsetLeft,
				boundingRect.top - offsetLeft,
				boundingRect.width,
				boundingRect.height,
			);
			contextToDraw.fillStyle = originalFillStyle;
		}
	}

	finish();
};
