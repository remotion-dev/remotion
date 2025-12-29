import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import type {LinearGradientInfo} from './parse-linear-gradient';
import {createCanvasGradient} from './parse-linear-gradient';
import {roundToExpandRect} from './round-to-expand-rect';

export const getPrecomposeRectForMask = (element: HTMLElement | SVGElement) => {
	const boundingRect = roundToExpandRect(getBiggestBoundingClientRect(element));

	return boundingRect;
};

export const handleMask = ({
	gradientInfo,
	rect,
	precomposeRect,
	tempContext,
}: {
	gradientInfo: LinearGradientInfo;
	rect: DOMRect;
	precomposeRect: DOMRect;
	tempContext: OffscreenCanvasRenderingContext2D;
}) => {
	const rectOffsetX = rect.left - precomposeRect.left;
	const rectOffsetY = rect.top - precomposeRect.top;

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
};
