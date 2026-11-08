import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import type {InternalState} from '../internal-state';
import {getBackgroundImageRect} from './background-image-rect';
import type {MaskImageInfo} from './mask-image';
import {createCanvasGradient} from './parse-linear-gradient';
import {getRasterImage} from './raster-image-loader';

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

	const image = await getRasterImage({
		src: maskImageInfo.src,
		sourceProperty: 'mask-image',
		state: internalState.rasterImageLoaderState,
	});
	const {maskSize, maskRepeat} = maskImageInfo;
	const {width, height} = getBackgroundImageRect({
		backgroundSize: maskSize,
		backgroundPosition: '0% 0%',
		positioningArea: maskRect,
		intrinsicSize: image,
	});

	tempContext.globalCompositeOperation = 'destination-in';
	if (width === 0 || height === 0) {
		tempContext.clearRect(
			0,
			0,
			tempContext.canvas.width,
			tempContext.canvas.height,
		);
		return;
	}

	const repetition =
		{
			'repeat repeat': 'repeat',
			'no-repeat no-repeat': 'no-repeat',
			'repeat no-repeat': 'repeat-x',
			'no-repeat repeat': 'repeat-y',
		}[maskRepeat] ?? maskRepeat;
	const imageWidth = width * scale;
	const imageHeight = height * scale;
	if (repetition === 'no-repeat') {
		// Preserve drawImage's filtering for a single tile, including the
		// previously supported full-size mask case.
		tempContext.drawImage(
			image,
			rectToFill.left,
			rectToFill.top,
			imageWidth,
			imageHeight,
		);
	} else {
		const pattern = tempContext.createPattern(image, repetition);
		if (!pattern) {
			throw new Error('Could not create URL mask pattern');
		}

		pattern.setTransform(
			new DOMMatrix()
				.translate(rectToFill.left, rectToFill.top)
				.scale(imageWidth / image.width, imageHeight / image.height),
		);
		tempContext.fillStyle = pattern;
		tempContext.fillRect(
			0,
			0,
			tempContext.canvas.width,
			tempContext.canvas.height,
		);
	}

	// Filter precomposition can extend beyond the border box. Preserve mask-clip
	// even when the pattern repeats into that expanded region.
	tempContext.save();
	tempContext.beginPath();
	tempContext.rect(0, 0, tempContext.canvas.width, tempContext.canvas.height);
	tempContext.rect(
		rectToFill.left,
		rectToFill.top,
		repetition === 'no-repeat'
			? Math.min(rectToFill.width, imageWidth)
			: rectToFill.width,
		repetition === 'no-repeat'
			? Math.min(rectToFill.height, imageHeight)
			: rectToFill.height,
	);
	tempContext.clip('evenodd');
	tempContext.clearRect(
		0,
		0,
		tempContext.canvas.width,
		tempContext.canvas.height,
	);
	tempContext.restore();
};
