import type {LogLevel} from 'remotion';
import type {InternalState} from '../internal-state';
import {createLayer} from '../take-screenshot';
import {getBlendMode} from './calculate-transforms';
import {getBackgroundFill, isColorTransparent} from './get-background-fill';
import {getBoxBasedOnBackgroundClip} from './get-padding-box';

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

	if (boundingRect.width <= 0 || boundingRect.height <= 0) {
		return;
	}

	if (backgroundClip.includes('text')) {
		offsetLeft = boundingRect.left;
		offsetTop = boundingRect.top;
		const originalBackgroundClip = element.style.backgroundClip;
		const originalWebkitBackgroundClip = element.style.webkitBackgroundClip;
		element.style.backgroundClip = 'initial';
		element.style.webkitBackgroundClip = 'initial';
		const textLayerCutout = new DOMRect(
			boundingRect.left + parentOffsetLeft,
			boundingRect.top + parentOffsetTop,
			boundingRect.width,
			boundingRect.height,
		);
		const onlyBackgroundClipText = await createLayer({
			element,
			cutout: textLayerCutout,
			logLevel,
			internalState,
			scale,
			onlyBackgroundClipText: true,
			waitForPageResponsiveness: null,
		});
		onlyBackgroundClipText.setTransform(new DOMMatrix().scale(scale, scale));
		element.style.backgroundClip = originalBackgroundClip;
		element.style.webkitBackgroundClip = originalWebkitBackgroundClip;
		contextToDraw = onlyBackgroundClipText;
		contextToDraw.globalCompositeOperation = 'source-in';
	}

	const blendMode = getBlendMode(computedStyle.backgroundBlendMode);
	if (
		backgroundImage !== 'none' &&
		(blendMode || !isColorTransparent(backgroundColor))
	) {
		// CSS backgrounds blend in their own isolated group, not with the
		// element's siblings, children or other content already on the canvas.
		const backgroundCanvas = new OffscreenCanvas(
			Math.ceil(boundingRect.width * scale),
			Math.ceil(boundingRect.height * scale),
		);
		const backgroundContext = backgroundCanvas.getContext('2d');
		if (!backgroundContext) {
			throw new Error('Could not create background blending context');
		}

		backgroundContext.scale(scale, scale);
		backgroundContext.fillStyle = backgroundColor;
		backgroundContext.fillRect(0, 0, boundingRect.width, boundingRect.height);
		const fill = getBackgroundFill({
			backgroundImage,
			backgroundPosition: computedStyle.backgroundPosition,
			backgroundSize: computedStyle.backgroundSize,
			backgroundColor: 'transparent',
			contextToDraw: backgroundContext,
			boundingRect,
			offsetLeft: boundingRect.left,
			offsetTop: boundingRect.top,
		});
		if (fill) {
			backgroundContext.globalCompositeOperation = blendMode ?? 'source-over';
			backgroundContext.fillStyle = fill;
			backgroundContext.fillRect(0, 0, boundingRect.width, boundingRect.height);
		}

		contextToDraw.drawImage(
			backgroundCanvas,
			boundingRect.left - offsetLeft,
			boundingRect.top - offsetTop,
			backgroundCanvas.width / scale,
			backgroundCanvas.height / scale,
		);
		return;
	}

	const backgroundFill = getBackgroundFill({
		backgroundImage,
		backgroundPosition: computedStyle.backgroundPosition,
		backgroundSize: computedStyle.backgroundSize,
		backgroundColor,
		contextToDraw,
		boundingRect,
		offsetLeft,
		offsetTop,
	});

	if (!backgroundFill) {
		return;
	}

	const originalFillStyle = contextToDraw.fillStyle;
	contextToDraw.fillStyle = backgroundFill;
	contextToDraw.fillRect(
		boundingRect.left - offsetLeft,
		boundingRect.top - offsetTop,
		boundingRect.width,
		boundingRect.height,
	);
	contextToDraw.fillStyle = originalFillStyle;
};
