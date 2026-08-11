import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import type {InternalState} from '../internal-state';
import type {MaskImageInfo} from './mask-image';
import {getMaskImage} from './mask-image-loader';
import {createCanvasGradient} from './parse-linear-gradient';

export const getPrecomposeRectForMask = (element: HTMLElement | SVGElement) => {
	const boundingRect = getBiggestBoundingClientRect(element);

	return boundingRect;
};

export const handleMask = async ({
	maskImageInfo,
	maskRect,
	precomposeRect,
	tempContext,
	scale,
	internalState,
}: {
	maskImageInfo: MaskImageInfo;
	maskRect: DOMRect;
	precomposeRect: DOMRect;
	tempContext: OffscreenCanvasRenderingContext2D;
	scale: number;
	internalState: InternalState;
}) => {
	const rectToFill = new DOMRect(
		(maskRect.left - precomposeRect.left) * scale,
		(maskRect.top - precomposeRect.top) * scale,
		maskRect.width * scale,
		maskRect.height * scale,
	);

	if (maskImageInfo.type === 'linear-gradient') {
		const gradient = createCanvasGradient({
			ctx: tempContext,
			rect: rectToFill,
			gradientInfo: maskImageInfo.gradientInfo,
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
		return;
	}

	const image = await getMaskImage({
		src: maskImageInfo.src,
		state: internalState.maskImageLoaderState,
	});
	tempContext.globalCompositeOperation = 'destination-in';
	tempContext.drawImage(
		image,
		rectToFill.left,
		rectToFill.top,
		rectToFill.width,
		rectToFill.height,
	);
};
