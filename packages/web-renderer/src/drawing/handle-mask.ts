import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import type {LinearGradientInfo} from './parse-linear-gradient';
import {createCanvasGradient} from './parse-linear-gradient';

export const getPrecomposeRectForMask = (element: HTMLElement | SVGElement) => {
	const boundingRect = getBiggestBoundingClientRect(element);

	return boundingRect;
};

export const handleMask = ({
	gradientInfo,
	maskRect,
	precomposeRect,
	tempContext,
	scale,
}: {
	gradientInfo: LinearGradientInfo;
	maskRect: DOMRect;
	precomposeRect: DOMRect;
	tempContext: OffscreenCanvasRenderingContext2D;
	scale: number;
}) => {
	const rectToFill = new DOMRect(
		(maskRect.left - precomposeRect.left) * scale,
		(maskRect.top - precomposeRect.top) * scale,
		maskRect.width * scale,
		maskRect.height * scale,
	);

	const gradient = createCanvasGradient({
		ctx: tempContext,
		rect: rectToFill,
		gradientInfo,
		offsetLeft: 0,
		offsetTop: 0,
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
