import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import type {InternalState} from '../internal-state';
import {getBackgroundImageRect} from './background-image-rect';
import type {MaskImageInfo} from './mask-image';
import {createCanvasGradient} from './parse-linear-gradient';
import {getRasterImage} from './raster-image-loader';
import {turnSvgIntoDrawable} from './turn-svg-into-drawable';

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

// Use the existing group layer and SVG drawable rather than combining contours
// whose reflected winding is interpreted differently by native engines.
export const handleSvgClip = async ({
	resource,
	maskRect,
	precomposeRect,
	tempContext,
}: {
	resource: SVGClipPathElement;
	maskRect: DOMRect;
	precomposeRect: DOMRect;
	tempContext: OffscreenCanvasRenderingContext2D;
}) => {
	const namespace = 'http://www.w3.org/2000/svg';
	const svg = resource.ownerDocument.createElementNS(namespace, 'svg');
	svg.setAttribute('width', String(tempContext.canvas.width));
	svg.setAttribute('height', String(tempContext.canvas.height));
	const x = precomposeRect.left - maskRect.left;
	const y = precomposeRect.top - maskRect.top;
	svg.setAttribute(
		'viewBox',
		`${x} ${y} ${precomposeRect.width} ${precomposeRect.height}`,
	);
	const clip = resource.cloneNode(true) as SVGClipPathElement;
	clip.id = 'remotion-svg-clip';
	const originals = Array.from(resource.children);
	for (let i = 0; i < originals.length; i++) {
		const originalRect = originals[i] as SVGRectElement;
		const style = getComputedStyle(originalRect);
		const child = clip.children[i] as SVGRectElement;
		child.style.clipRule = style.clipRule;
		child.style.display = style.display;
		// Resolve lengths against the original SVG viewport before serialization.
		for (const attribute of ['x', 'y', 'width', 'height'] as const)
			child.setAttribute(
				attribute,
				String(originalRect[attribute].baseVal.value),
			);
	}

	if (
		resource.clipPathUnits.baseVal ===
		SVGUnitTypes.SVG_UNIT_TYPE_OBJECTBOUNDINGBOX
	) {
		clip.setAttribute('clipPathUnits', 'userSpaceOnUse');
		clip.setAttribute(
			'transform',
			`scale(${maskRect.width} ${maskRect.height}) ${resource.getAttribute('transform') ?? ''}`,
		);
	}

	const defs = resource.ownerDocument.createElementNS(namespace, 'defs');
	defs.appendChild(clip);
	svg.appendChild(defs);
	const rect = resource.ownerDocument.createElementNS(namespace, 'rect');
	rect.setAttribute('x', String(x));
	rect.setAttribute('y', String(y));
	rect.setAttribute('width', String(precomposeRect.width));
	rect.setAttribute('height', String(precomposeRect.height));
	rect.setAttribute('fill', 'white');
	rect.setAttribute('clip-path', 'url(#remotion-svg-clip)');
	svg.appendChild(rect);
	const image = await turnSvgIntoDrawable(svg);
	tempContext.globalCompositeOperation = 'destination-in';
	tempContext.drawImage(image, 0, 0);
};
