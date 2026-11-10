import type {LogLevel} from 'remotion';
import type {InternalState} from '../internal-state';
import {createLayer} from '../take-screenshot';
import {getBlendMode} from './calculate-transforms';
import {getBackgroundFill, isColorTransparent} from './get-background-fill';
import {getBoxBasedOnBackgroundClip} from './get-padding-box';
import {parseUrlFunction} from './mask-image';

export const drawBackground = async ({
	hasCssTransform,
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
	hasCssTransform: boolean;
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

	if (boundingRect.width <= 0 || boundingRect.height <= 0) {
		return;
	}

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
			transparent: true,
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

	const positioningArea = getBoxBasedOnBackgroundClip(
		rect,
		computedStyle,
		computedStyle.backgroundOrigin,
	);
	const paintFill = (
		target: OffscreenCanvasRenderingContext2D,
		fill: Awaited<ReturnType<typeof getBackgroundFill>>,
		originX: number,
		originY: number,
	) => {
		if (!fill) return;
		const previousSmoothing = target.imageSmoothingEnabled;
		using _restoreImageSmoothing = {
			[Symbol.dispose]: () => {
				target.imageSmoothingEnabled = previousSmoothing;
			},
		};
		if (
			computedStyle.imageRendering === 'pixelated' &&
			parseUrlFunction(backgroundImage) !== null
		) {
			target.imageSmoothingEnabled = false;
		}

		if ('image' in fill) {
			target.save();
			target.beginPath();
			target.rect(
				boundingRect.left - originX,
				boundingRect.top - originY,
				boundingRect.width,
				boundingRect.height,
			);
			target.clip();
			const matrix = target.getTransform();
			// Transformed native backgrounds sample in local paint coordinates.
			// Localize integer translations without changing the tile geometry.
			const localizeTranslation =
				computedStyle.imageRendering === 'pixelated' &&
				hasCssTransform &&
				matrix.a === 1 &&
				matrix.b === 0 &&
				matrix.c === 0 &&
				matrix.d === 1 &&
				Number.isInteger(matrix.e) &&
				Number.isInteger(matrix.f);
			for (const tile of fill.rects) {
				const left = Math.round(tile.left - originX);
				const top = Math.round(tile.top - originY);
				const right = Math.round(tile.right - originX);
				const bottom = Math.round(tile.bottom - originY);
				if (localizeTranslation) {
					target.translate(left, top);
					target.drawImage(fill.image, 0, 0, right - left, bottom - top);
					target.translate(-left, -top);
				} else {
					target.drawImage(fill.image, left, top, right - left, bottom - top);
				}
			}

			target.restore();
			return;
		}

		const previous = target.fillStyle;
		target.fillStyle = fill;
		target.fillRect(
			boundingRect.left - originX,
			boundingRect.top - originY,
			boundingRect.width,
			boundingRect.height,
		);
		target.fillStyle = previous;
	};

	const blendMode = getBlendMode(computedStyle.backgroundBlendMode);
	if (
		backgroundImage !== 'none' &&
		(blendMode ||
			contextToDraw !== context ||
			(!isColorTransparent(backgroundColor) &&
				(context.globalAlpha !== 1 || context.filter !== 'none')))
	) {
		// Blend inside the background group before applying element opacity, filters and text masks.
		const backgroundCanvas = new OffscreenCanvas(
			Math.ceil(boundingRect.width * scale),
			Math.ceil(boundingRect.height * scale),
		);
		const backgroundContext = backgroundCanvas.getContext('2d');
		if (!backgroundContext)
			throw new Error('Could not create background compositing context');
		backgroundContext.scale(scale, scale);
		backgroundContext.fillStyle = backgroundColor;
		backgroundContext.fillRect(0, 0, boundingRect.width, boundingRect.height);
		const groupFill = await getBackgroundFill({
			backgroundImage,
			backgroundRepeat: computedStyle.backgroundRepeat,
			internalState,
			positioningArea,
			backgroundPosition: computedStyle.backgroundPosition,
			backgroundSize: computedStyle.backgroundSize,
			contextToDraw: backgroundContext,
			boundingRect,
			offsetLeft: boundingRect.left,
			offsetTop: boundingRect.top,
		});
		backgroundContext.globalCompositeOperation = blendMode ?? 'source-over';
		paintFill(
			backgroundContext,
			groupFill,
			boundingRect.left,
			boundingRect.top,
		);
		contextToDraw.drawImage(
			backgroundCanvas,
			boundingRect.left - offsetLeft,
			boundingRect.top - offsetTop,
			backgroundCanvas.width / scale,
			backgroundCanvas.height / scale,
		);
		return;
	}

	if (backgroundColor && !isColorTransparent(backgroundColor)) {
		const previous = contextToDraw.fillStyle;
		contextToDraw.fillStyle = backgroundColor;
		contextToDraw.fillRect(
			boundingRect.left - offsetLeft,
			boundingRect.top - offsetTop,
			boundingRect.width,
			boundingRect.height,
		);
		contextToDraw.fillStyle = previous;
	}

	const backgroundFill = await getBackgroundFill({
		backgroundImage,
		backgroundRepeat: computedStyle.backgroundRepeat,
		internalState,
		positioningArea,
		backgroundPosition: computedStyle.backgroundPosition,
		backgroundSize: computedStyle.backgroundSize,
		contextToDraw,
		boundingRect,
		offsetLeft,
		offsetTop,
	});
	paintFill(contextToDraw, backgroundFill, offsetLeft, offsetTop);
};
