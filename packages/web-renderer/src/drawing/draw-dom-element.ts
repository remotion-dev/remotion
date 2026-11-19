import {calculateObjectFit, parseObjectFit} from './calculate-object-fit';
import type {DrawFn} from './drawn-fn';
import {fitSvgIntoItsContainer} from './fit-svg-into-its-dimensions';
import {scopeSvgForRasterization} from './scope-svg-for-rasterization';
import {
	svgDrawableMetadata,
	turnSvgIntoDrawable,
} from './turn-svg-into-drawable';

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

const drawSvgThroughReadbackCanvas = ({
	drawable,
	fitted,
	context,
}: {
	drawable: HTMLImageElement;
	fitted: ReturnType<typeof fitSvgIntoItsContainer>;
	context: OffscreenCanvasRenderingContext2D;
}) => {
	const {width, height} = context.canvas;
	const transform = context.getTransform();
	let left = 0;
	let top = 0;
	let right = width;
	let bottom = height;
	// Effects can paint outside the image's transformed rectangle. Keep their
	// existing full-surface transfer until their paint bounds are known.
	if (
		(typeof context.filter !== 'string' || context.filter === 'none') &&
		(context.shadowColor === 'rgba(0, 0, 0, 0)' ||
			context.shadowColor === 'transparent')
	) {
		const corners = [
			[fitted.left, fitted.top],
			[fitted.left + fitted.width, fitted.top],
			[fitted.left, fitted.top + fitted.height],
			[fitted.left + fitted.width, fitted.top + fitted.height],
		].map(([x, y]) => ({
			x: transform.a * x + transform.c * y + transform.e,
			y: transform.b * x + transform.d * y + transform.f,
		}));
		if (
			corners.every(
				(point) => Number.isFinite(point.x) && Number.isFinite(point.y),
			)
		) {
			left = Math.max(
				0,
				Math.min(
					width,
					Math.floor(Math.min(...corners.map((point) => point.x))),
				),
			);
			top = Math.max(
				0,
				Math.min(
					height,
					Math.floor(Math.min(...corners.map((point) => point.y))),
				),
			);
			right = Math.min(
				width,
				Math.max(0, Math.ceil(Math.max(...corners.map((point) => point.x)))),
			);
			bottom = Math.min(
				height,
				Math.max(0, Math.ceil(Math.max(...corners.map((point) => point.y)))),
			);
		}
	}

	const scratchWidth = right - left;
	const scratchHeight = bottom - top;
	if (
		context.globalCompositeOperation !== 'source-over' ||
		width <= 0 ||
		height <= 0 ||
		scratchWidth > 16384 ||
		scratchHeight > 16384 ||
		scratchWidth * scratchHeight > 16 * 1024 ** 2
	)
		return false;
	if (scratchWidth <= 0 || scratchHeight <= 0) return true;
	const scratch = new OffscreenCanvas(scratchWidth, scratchHeight);
	try {
		const readbackContext = scratch.getContext('2d', {
			alpha: true,
			willReadFrequently: true,
		});
		if (!readbackContext) return false;
		readbackContext.drawImage(
			context.canvas,
			left,
			top,
			scratchWidth,
			scratchHeight,
			0,
			0,
			scratchWidth,
			scratchHeight,
		);
		readbackContext.setTransform(
			transform.a,
			transform.b,
			transform.c,
			transform.d,
			transform.e - left,
			transform.f - top,
		);
		readbackContext.globalAlpha = context.globalAlpha;
		readbackContext.filter = context.filter;
		readbackContext.shadowColor = context.shadowColor;
		readbackContext.shadowBlur = context.shadowBlur;
		readbackContext.shadowOffsetX = context.shadowOffsetX;
		readbackContext.shadowOffsetY = context.shadowOffsetY;
		readbackContext.drawImage(
			drawable,
			fitted.left,
			fitted.top,
			fitted.width,
			fitted.height,
		);
		context.save();
		try {
			context.resetTransform();
			const copyBounds = new Path2D();
			copyBounds.rect(left, top, scratchWidth, scratchHeight);
			context.clip(copyBounds);
			context.globalCompositeOperation = 'copy';
			context.globalAlpha = 1;
			context.filter = 'none';
			context.shadowColor = 'transparent';
			context.drawImage(scratch, left, top);
		} finally {
			context.restore();
		}

		return true;
	} finally {
		scratch.width = 0;
		scratch.height = 0;
	}
};

const rasterizedSvgByDrawable = new WeakMap<
	HTMLImageElement,
	{
		key: string;
		image: Promise<HTMLImageElement> | null;
	}
>();

const drawSvgAtOutputResolution = async ({
	drawable,
	fitted,
	context,
}: {
	drawable: HTMLImageElement;
	fitted: ReturnType<typeof fitSvgIntoItsContainer>;
	context: OffscreenCanvasRenderingContext2D;
}) => {
	const {width, height} = context.canvas;
	const transform = context.getTransform();
	if (
		context.globalCompositeOperation !== 'source-over' ||
		width <= 0 ||
		height <= 0 ||
		width > 16384 ||
		height > 16384 ||
		width * height > 16 * 1024 ** 2
	)
		return false;
	const key = JSON.stringify([
		width,
		height,
		transform.a,
		transform.b,
		transform.c,
		transform.d,
		transform.e,
		transform.f,
		fitted.left,
		fitted.top,
		fitted.width,
		fitted.height,
	]);
	let entry = rasterizedSvgByDrawable.get(drawable);
	if (entry?.key !== key) {
		const metadata = svgDrawableMetadata.get(drawable);
		if (metadata === undefined)
			throw new Error('SVG source markup is unavailable');
		const svg = new DOMParser().parseFromString(
			metadata.markup,
			'image/svg+xml',
		).documentElement as unknown as SVGSVGElement;
		if (!scopeSvgForRasterization(svg)) {
			rasterizedSvgByDrawable.set(drawable, {key, image: null});
			return false;
		}

		const logicalWidth = metadata.width;
		const logicalHeight = metadata.height;
		if (!(logicalWidth > 0) || !(logicalHeight > 0)) return false;
		// An outermost SVG ignores x/y. Keep that behavior after it becomes nested,
		// and freeze its viewport without changing authored geometry attributes.
		svg.setAttribute(
			'style',
			(svg.getAttribute('style') ?? '') +
				`;x:0px!important;y:0px!important;width:${logicalWidth}px!important;height:${logicalHeight}px!important;`,
		);
		const matrix = transform
			.translate(fitted.left, fitted.top)
			.scale(fitted.width / logicalWidth, fitted.height / logicalHeight);
		const document = svg.ownerDocument.implementation.createDocument(
			'http://www.w3.org/2000/svg',
			'svg',
			null,
		);
		document.documentElement.setAttribute('width', String(width));
		document.documentElement.setAttribute('height', String(height));
		const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		group.setAttribute(
			'transform',
			`matrix(${matrix.a} ${matrix.b} ${matrix.c} ${matrix.d} ${matrix.e} ${matrix.f})`,
		);
		group.appendChild(document.importNode(svg, true));
		document.documentElement.appendChild(group);
		const paddedMarkup = new XMLSerializer().serializeToString(document);
		const image = new Promise<HTMLImageElement>((resolve, reject) => {
			const loaded = new Image();
			loaded.onload = () => resolve(loaded);
			loaded.onerror = () =>
				reject(new Error('Failed to rasterize SVG at output resolution'));
			loaded.src =
				'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(paddedMarkup);
		});
		entry = {key, image};
		rasterizedSvgByDrawable.set(drawable, entry);
		image.catch(() => {
			if (rasterizedSvgByDrawable.get(drawable)?.image === image)
				rasterizedSvgByDrawable.delete(drawable);
		});
	}

	if (entry.image === null) return false;
	const rasterized = await entry.image;
	context.save();
	try {
		context.resetTransform();
		context.drawImage(rasterized, 0, 0);
	} finally {
		context.restore();
	}

	return true;
};

/**
 * Draw an SVG element using "contain" behavior (the default for SVGs).
 */
const drawSvg = async ({
	rasterize,
	alwaysReadback,
	readback,
	drawable,
	dimensions,
	contextToDraw,
}: {
	rasterize: boolean;
	alwaysReadback: boolean;
	readback: boolean;
	drawable: HTMLImageElement;
	dimensions: DOMRect;
	contextToDraw: OffscreenCanvasRenderingContext2D;
}) => {
	const metadata = svgDrawableMetadata.get(drawable);
	const fitted = fitSvgIntoItsContainer({
		containerSize: dimensions,
		elementSize: {
			width: metadata?.width ?? drawable.width,
			height: metadata?.height ?? drawable.height,
		},
	});
	const transform = contextToDraw.getTransform();
	const needsRasterization =
		transform.a !== 1 ||
		transform.b !== 0 ||
		transform.c !== 0 ||
		transform.d !== 1 ||
		!Number.isInteger(transform.e) ||
		!Number.isInteger(transform.f) ||
		[fitted.left, fitted.top, fitted.width, fitted.height].some(
			(value) => !Number.isInteger(value),
		);
	if (
		rasterize &&
		needsRasterization &&
		(await drawSvgAtOutputResolution({
			drawable,
			fitted,
			context: contextToDraw,
		}))
	)
		return;

	if (
		readback &&
		(alwaysReadback || needsRasterization) &&
		drawSvgThroughReadbackCanvas({
			drawable,
			fitted,
			context: contextToDraw,
		})
	)
		return;

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
		objectPosition: computedStyle.objectPosition,
		containerSize: {
			width: dimensions.width,
			height: dimensions.height,
			left: dimensions.left,
			top: dimensions.top,
		},
		intrinsicSize,
	});

	if (result.destWidth === 0 || result.destHeight === 0) {
		return;
	}

	if (
		drawable instanceof HTMLImageElement &&
		(/^data:image\/svg\+xml[\t\n\f\r ]*[;,]/i.test(drawable.currentSrc) ||
			(drawable.currentSrc !== '' &&
				new URL(drawable.currentSrc).pathname.toLowerCase().endsWith('.svg')))
	) {
		// SVG sources are rasterized at their concrete size; crop the destination
		// rather than indexing the SVG's intrinsic source pixels.
		const scaleX = result.destWidth / result.sourceWidth;
		const scaleY = result.destHeight / result.sourceHeight;
		const destX = result.destX - result.sourceX * scaleX;
		const destY = result.destY - result.sourceY * scaleY;
		const destWidth = intrinsicSize.width * scaleX;
		const destHeight = intrinsicSize.height * scaleY;

		const overflowsBox =
			destX < dimensions.left ||
			destY < dimensions.top ||
			destX + destWidth > dimensions.left + dimensions.width ||
			destY + destHeight > dimensions.top + dimensions.height;

		if (!overflowsBox) {
			contextToDraw.drawImage(drawable, destX, destY, destWidth, destHeight);
			return;
		}

		// Crop on a separate canvas instead of clipping this context, so that a
		// CSS filter set on this context (e.g. blur) can still extend past the box.
		const {a, b, c, d} = contextToDraw.getTransform();
		const cropWidth = Math.max(
			1,
			Math.ceil(dimensions.width * Math.hypot(a, b)),
		);
		const cropHeight = Math.max(
			1,
			Math.ceil(dimensions.height * Math.hypot(c, d)),
		);
		const crop = new OffscreenCanvas(cropWidth, cropHeight);
		const cropContext = crop.getContext('2d');
		if (!cropContext) {
			throw new Error('Could not get 2D context to crop SVG image');
		}

		cropContext.scale(
			cropWidth / dimensions.width,
			cropHeight / dimensions.height,
		);
		cropContext.drawImage(
			drawable,
			destX - dimensions.left,
			destY - dimensions.top,
			destWidth,
			destHeight,
		);
		contextToDraw.drawImage(
			crop,
			dimensions.left,
			dimensions.top,
			dimensions.width,
			dimensions.height,
		);
		return;
	}

	const previousSmoothing = contextToDraw.imageSmoothingEnabled;
	using _restoreImageSmoothing = {
		[Symbol.dispose]: () => {
			contextToDraw.imageSmoothingEnabled = previousSmoothing;
		},
	};
	if (computedStyle.imageRendering === 'pixelated') {
		contextToDraw.imageSmoothingEnabled = false;
	}

	// Preserve the concrete destination size when the entire image is visible.
	if (
		drawable instanceof HTMLImageElement &&
		result.sourceX === 0 &&
		result.sourceY === 0 &&
		result.sourceWidth === intrinsicSize.width &&
		result.sourceHeight === intrinsicSize.height
	) {
		contextToDraw.drawImage(
			drawable,
			result.destX,
			result.destY,
			result.destWidth,
			result.destHeight,
		);
		return;
	}

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
			const userAgent =
				node.ownerDocument.defaultView?.navigator.userAgent ?? '';
			await drawSvg({
				rasterize: /Firefox\//.test(userAgent),
				alwaysReadback: Boolean(node.querySelector('text, foreignObject')),
				drawable,
				dimensions,
				contextToDraw,
				readback:
					/AppleWebKit/.test(userAgent) &&
					!/Chrome\/|Chromium\/|Android/.test(userAgent) &&
					!node.querySelector('feImage'),
			});
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
