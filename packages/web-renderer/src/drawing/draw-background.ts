import type {LogLevel} from 'remotion';
import type {InternalState} from '../internal-state';
import {getBoxBasedOnBackgroundClip} from './get-padding-box';
import {
	createCanvasGradient,
	parseLinearGradient,
} from './parse-linear-gradient';
import {precomposeDOMElement} from './precompose';

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
	offsetLeft: parentOffsetLeft,
	offsetTop: parentOffsetTop,
	scale,
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
	offsetLeft: number;
	offsetTop: number;
	scale: number;
}) => {
	let contextToDraw = context;

	const originalCompositeOperation = context.globalCompositeOperation;
	let offsetLeft = 0;
	let offsetTop = 0;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	using _ = {
		[Symbol.dispose]: () => {
			context.globalCompositeOperation = originalCompositeOperation;
			if (context !== contextToDraw) {
				context.drawImage(
					contextToDraw.canvas,
					offsetLeft,
					offsetTop,
					// The context currently has a transform of `scale(scale, scale)`, and we requested
					// a canvas with extra scale as well, dividing, since the context will multiply it again.
					contextToDraw.canvas.width / scale,
					contextToDraw.canvas.height / scale,
				);
			}
		},
	};

	const boundingRect = getBoxBasedOnBackgroundClip(
		rect,
		computedStyle,
		backgroundClip,
	);

	if (backgroundClip.includes('text')) {
		offsetLeft = boundingRect.left;
		offsetTop = boundingRect.top;
		const originalBackgroundClip = element.style.backgroundClip;
		const originalWebkitBackgroundClip = element.style.webkitBackgroundClip;
		element.style.backgroundClip = 'initial';
		element.style.webkitBackgroundClip = 'initial';
		const onlyBackgroundClipText = await precomposeDOMElement({
			element,
			boundingRect: new DOMRect(
				boundingRect.left + parentOffsetLeft,
				boundingRect.top + parentOffsetTop,
				boundingRect.width,
				boundingRect.height,
			),
			logLevel,
			internalState,
			scale,
			onlyBackgroundClip: true,
		});
		onlyBackgroundClipText.setTransform(new DOMMatrix().scale(scale, scale));
		element.style.backgroundClip = originalBackgroundClip;
		element.style.webkitBackgroundClip = originalWebkitBackgroundClip;
		contextToDraw = onlyBackgroundClipText;
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
			boundingRect.top - offsetTop,
			boundingRect.width,
			boundingRect.height,
		);
		contextToDraw.fillStyle = originalFillStyle;
	}

	finish();
};
