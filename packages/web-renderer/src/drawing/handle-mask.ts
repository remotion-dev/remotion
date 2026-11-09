import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import type {InternalState} from '../internal-state';
import {getBackgroundImageRect} from './background-image-rect';
import {createCssMask} from './css-mask';
import type {MaskImageInfo} from './mask-image';
import {createCanvasGradient} from './parse-linear-gradient';
import {getRasterImage} from './raster-image-loader';
import {createSvgClipMask} from './svg-clip-mask';

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
	if (maskImageInfo.type === 'layers') {
		const groupImage = await createCssMask({
			maskImageInfo,
			maskRect,
			precomposeRect,
			width: tempContext.canvas.width,
			height: tempContext.canvas.height,
			internalState,
		});
		const mask = new OffscreenCanvas(
			tempContext.canvas.width,
			tempContext.canvas.height,
		).getContext('2d', {willReadFrequently: true});
		if (!mask) throw new Error('Could not create mask group context');
		try {
			// Rasterize the native mask group before applying it to the content. The
			// readback context preserves fractional alpha at this SVG drawable seam.
			mask.drawImage(groupImage, 0, 0);
			tempContext.globalCompositeOperation = 'destination-in';
			tempContext.drawImage(mask.canvas, 0, 0);
		} finally {
			mask.canvas.width = 0;
			mask.canvas.height = 0;
		}

		return;
	}

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
	const {maskSize, maskRepeat, maskPosition} = maskImageInfo;
	const tile = getBackgroundImageRect({
		backgroundSize: maskSize,
		backgroundPosition: maskPosition,
		positioningArea: maskRect,
		intrinsicSize: image,
	});
	const {width, height} = tile;
	const imageLeft = (tile.left - precomposeRect.left) * scale;
	const imageTop = (tile.top - precomposeRect.top) * scale;

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
		tempContext.drawImage(image, imageLeft, imageTop, imageWidth, imageHeight);
	} else {
		const pattern = tempContext.createPattern(image, repetition);
		if (!pattern) {
			throw new Error('Could not create URL mask pattern');
		}

		pattern.setTransform(
			new DOMMatrix()
				.translate(imageLeft, imageTop)
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
	const clipLeft =
		repetition === 'no-repeat'
			? Math.max(rectToFill.left, imageLeft)
			: rectToFill.left;
	const clipTop =
		repetition === 'no-repeat'
			? Math.max(rectToFill.top, imageTop)
			: rectToFill.top;
	tempContext.rect(
		clipLeft,
		clipTop,
		repetition === 'no-repeat'
			? Math.max(
					0,
					Math.min(rectToFill.right, imageLeft + imageWidth) - clipLeft,
				)
			: rectToFill.width,
		repetition === 'no-repeat'
			? Math.max(
					0,
					Math.min(rectToFill.bottom, imageTop + imageHeight) - clipTop,
				)
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

// Use the existing group layer and SVG drawable rather than combining contours
// whose reflected winding is interpreted differently by native engines.
export const handleSvgClip = async ({
	resource,
	maskRect,
	precomposeRect,
	element,
	tempContext,
}: {
	resource: SVGClipPathElement;
	element: HTMLElement | SVGElement;
	maskRect: DOMRect;
	precomposeRect: DOMRect;
	tempContext: OffscreenCanvasRenderingContext2D;
}) => {
	const image = await createSvgClipMask({
		resource,
		maskRect,
		precomposeRect,
		// Descendant filters contribute to the native HTML clipping reference in
		// Firefox. The clipped element's own filter and outline padding do not.
		referenceRect: getBiggestBoundingClientRect(element, false, true),
		width: tempContext.canvas.width,
		height: tempContext.canvas.height,
	});
	tempContext.globalCompositeOperation = 'destination-in';
	tempContext.drawImage(image, 0, 0);
};
