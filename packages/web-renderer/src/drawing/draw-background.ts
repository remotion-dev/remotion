import type {LogLevel} from 'remotion';
import type {InternalState} from '../internal-state';
import {createLayer} from '../take-screenshot';
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

	if (backgroundColor && !isColorTransparent(backgroundColor)) {
		const previousColor = contextToDraw.fillStyle;
		contextToDraw.fillStyle = backgroundColor;
		contextToDraw.fillRect(
			boundingRect.left - offsetLeft,
			boundingRect.top - offsetTop,
			boundingRect.width,
			boundingRect.height,
		);
		contextToDraw.fillStyle = previousColor;
	}

	const backgroundFill = await getBackgroundFill({
		backgroundImage,
		backgroundRepeat: computedStyle.backgroundRepeat,
		internalState,
		positioningArea: getBoxBasedOnBackgroundClip(
			rect,
			computedStyle,
			computedStyle.backgroundOrigin,
		),
		backgroundPosition: computedStyle.backgroundPosition,
		backgroundSize: computedStyle.backgroundSize,
		contextToDraw,
		boundingRect,
		offsetLeft,
		offsetTop,
	});

	if (!backgroundFill) {
		return;
	}

	if ('image' in backgroundFill) {
		contextToDraw.save();
		contextToDraw.beginPath();
		contextToDraw.rect(
			boundingRect.left - offsetLeft,
			boundingRect.top - offsetTop,
			boundingRect.width,
			boundingRect.height,
		);
		contextToDraw.clip();
		// Browser background painting snaps the destination edges before applying
		// the element transform, including a half-pixel percentage position.
		const left = Math.round(backgroundFill.rect.left - offsetLeft);
		const top = Math.round(backgroundFill.rect.top - offsetTop);
		const right = Math.round(backgroundFill.rect.right - offsetLeft);
		const bottom = Math.round(backgroundFill.rect.bottom - offsetTop);
		contextToDraw.drawImage(
			backgroundFill.image,
			left,
			top,
			right - left,
			bottom - top,
		);
		contextToDraw.restore();
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
