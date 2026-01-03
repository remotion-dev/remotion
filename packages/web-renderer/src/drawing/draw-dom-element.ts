import {calculateObjectFit, parseObjectFit} from './calculate-object-fit';
import type {DrawFn} from './drawn-fn';
import {fitSvgIntoItsContainer} from './fit-svg-into-its-dimensions';
import {turnSvgIntoDrawable} from './turn-svg-into-drawable';

const getReadableImageError = (
	err: unknown,
	node: HTMLImageElement,
): Error | null => {
	if (!(err instanceof DOMException)) {
		return null;
	}

	if (err.name === 'SecurityError') {
		return new Error(
			`Could not draw image with src="${node.src}" to canvas: ` +
				`The image is tainted due to CORS restrictions. ` +
				`The server hosting this image must respond with the "Access-Control-Allow-Origin" header. ` +
				`See: https://remotion.dev/docs/client-side-rendering/migration`,
		);
	}

	if (err.name === 'InvalidStateError') {
		return new Error(
			`Could not draw image with src="${node.src}" to canvas: ` +
				`The image is in a broken state. ` +
				`This usually means the image failed to load - check that the URL is valid and accessible.`,
		);
	}

	return null;
};

/**
 * Draw an SVG element using "contain" behavior (the default for SVGs).
 */
const drawSvg = ({
	drawable,
	dimensions,
	contextToDraw,
}: {
	drawable: HTMLImageElement;
	dimensions: DOMRect;
	contextToDraw: OffscreenCanvasRenderingContext2D;
}) => {
	const fitted = fitSvgIntoItsContainer({
		containerSize: dimensions,
		elementSize: {
			width: drawable.width,
			height: drawable.height,
		},
	});
	contextToDraw.drawImage(
		drawable,
		fitted.left,
		fitted.top,
		fitted.width,
		fitted.height,
	);
};

/**
 * Draw an image or canvas element using the object-fit CSS property.
 */
const drawReplacedElement = ({
	drawable,
	dimensions,
	computedStyle,
	contextToDraw,
}: {
	drawable: HTMLImageElement | HTMLCanvasElement;
	dimensions: DOMRect;
	computedStyle: CSSStyleDeclaration;
	contextToDraw: OffscreenCanvasRenderingContext2D;
}) => {
	const objectFit = parseObjectFit(computedStyle.objectFit);

	const intrinsicSize =
		drawable instanceof HTMLImageElement
			? {width: drawable.naturalWidth, height: drawable.naturalHeight}
			: {width: drawable.width, height: drawable.height};

	const result = calculateObjectFit({
		objectFit,
		containerSize: {
			width: dimensions.width,
			height: dimensions.height,
			left: dimensions.left,
			top: dimensions.top,
		},
		intrinsicSize,
	});

	// Use the 9-argument drawImage to support source cropping (for cover mode)
	contextToDraw.drawImage(
		drawable,
		result.sourceX,
		result.sourceY,
		result.sourceWidth,
		result.sourceHeight,
		result.destX,
		result.destY,
		result.destWidth,
		result.destHeight,
	);
};

export const drawDomElement = (node: HTMLElement | SVGElement) => {
	const domDrawFn: DrawFn = async ({
		dimensions,
		contextToDraw,
		computedStyle,
	}) => {
		// Handle SVG elements separately - they use "contain" behavior by default
		if (node instanceof SVGSVGElement) {
			const drawable = await turnSvgIntoDrawable(node);
			drawSvg({drawable, dimensions, contextToDraw});
			return;
		}

		// Handle replaced elements (img, canvas) with object-fit support
		if (node instanceof HTMLImageElement || node instanceof HTMLCanvasElement) {
			try {
				drawReplacedElement({
					drawable: node,
					dimensions,
					computedStyle,
					contextToDraw,
				});
			} catch (err) {
				if (node instanceof HTMLImageElement) {
					const readableError = getReadableImageError(err, node);
					if (readableError) {
						throw readableError;
					}
				}

				throw err;
			}
		}
	};

	return domDrawFn;
};
