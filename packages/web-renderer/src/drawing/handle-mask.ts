import type {LogLevel} from 'remotion';
import {compose} from '../compose';
import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import type {InternalState} from '../internal-state';
import {doRectsIntersect} from './do-rects-intersect';
import type {LinearGradientInfo} from './parse-linear-gradient';
import {createCanvasGradient} from './parse-linear-gradient';
import {roundToExpandRect} from './round-to-expand-rect';

export const handleMask = async ({
	element,
	parentRect,
	context,
	logLevel,
	internalState,
	gradientInfo,
	rect,
}: {
	element: HTMLElement | SVGElement;
	parentRect: DOMRect;
	context: OffscreenCanvasRenderingContext2D;
	logLevel: LogLevel;
	internalState: InternalState;
	gradientInfo: LinearGradientInfo;
	rect: DOMRect;
}) => {
	const previousMaskImage = element.style.maskImage;
	const previousWebkitMaskImage = element.style.webkitMaskImage;
	element.style.maskImage = 'none';
	element.style.webkitMaskImage = 'none';

	const reset = () => {
		element.style.maskImage = previousMaskImage;
		element.style.webkitMaskImage = previousWebkitMaskImage;
	};

	const boundingRect = roundToExpandRect(getBiggestBoundingClientRect(element));

	if (boundingRect.width <= 0 || boundingRect.height <= 0) {
		reset();
		return;
	}

	if (!doRectsIntersect(boundingRect, parentRect)) {
		reset();
		return;
	}

	const tempCanvas = new OffscreenCanvas(
		boundingRect.width,
		boundingRect.height,
	);

	const tempContext = tempCanvas.getContext('2d')!;

	const rectOffsetX = rect.left - boundingRect.left;
	const rectOffsetY = rect.top - boundingRect.top;

	await compose({
		element,
		context: tempContext,
		logLevel,
		parentRect: boundingRect,
		internalState,
	});

	const rectToFill = new DOMRect(
		rectOffsetX,
		rectOffsetY,
		rect.width,
		rect.height,
	);

	const gradient = createCanvasGradient({
		ctx: tempContext,
		rect: rectToFill,
		gradientInfo,
	});

	tempContext.globalCompositeOperation = 'destination-in';
	tempContext.fillStyle = gradient;
	tempContext.fillRect(
		rectToFill.left,
		rectToFill.top,
		rectToFill.width,
		rectToFill.height,
	);

	const previousTransform = context.getTransform();

	context.setTransform(new DOMMatrix());

	context.drawImage(
		tempCanvas,
		boundingRect.left,
		boundingRect.top,
		boundingRect.width,
		boundingRect.height,
	);

	context.setTransform(previousTransform);

	reset();
};
