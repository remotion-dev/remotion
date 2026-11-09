import type {InternalState} from '../internal-state';
import {getBackgroundImageRect} from './background-image-rect';
import {parseUrlFunction} from './mask-image';
import {
	createCanvasGradient,
	parseRadialGradient,
	createRadialGradientFill,
	parseLinearGradient,
} from './parse-linear-gradient';
import {getRasterImage} from './raster-image-loader';

export const isColorTransparent = (color: string) => {
	return (
		color === 'transparent' ||
		(color.startsWith('rgba') &&
			(color.endsWith(', 0)') || color.endsWith(',0')))
	);
};

// Space repeats pin the first and last tiles to the positioning area. When
// fewer than two fit, CSS uses the positioned image once instead.
const getTilePositions = ({
	repeat,
	start,
	size,
	areaStart,
	areaSize,
	paintStart,
	paintEnd,
}: {
	repeat: string;
	start: number;
	size: number;
	areaStart: number;
	areaSize: number;
	paintStart: number;
	paintEnd: number;
}) => {
	const count = Math.floor(areaSize / size);
	if (repeat === 'no-repeat' || count < 2) return [start];
	const stride = (areaSize - size) / (count - 1);
	const origin = areaStart;
	const positions: number[] = [];
	let cursor = origin + Math.floor((paintStart - origin) / stride) * stride;
	for (; cursor < paintEnd; cursor += stride) {
		if (cursor + size > paintStart) positions.push(cursor);
	}

	return positions;
};

export const getBackgroundFill = async ({
	backgroundImage,
	backgroundPosition,
	backgroundSize,
	backgroundRepeat,
	internalState,
	positioningArea,
	contextToDraw,
	boundingRect,
	offsetLeft,
	offsetTop,
}: {
	backgroundImage: string;
	backgroundPosition: string;
	backgroundSize: string;
	backgroundRepeat: string;
	internalState: InternalState;
	positioningArea: DOMRect;
	contextToDraw: OffscreenCanvasRenderingContext2D;
	boundingRect: DOMRect;
	offsetLeft: number;
	offsetTop: number;
}): Promise<
	| CanvasGradient
	| CanvasPattern
	| {image: ImageBitmap; rects: Iterable<DOMRect>}
	| null
> => {
	if (backgroundImage && backgroundImage !== 'none') {
		const url = parseUrlFunction(backgroundImage);
		if (url !== null) {
			const image = await getRasterImage({
				src: url,
				state: internalState.rasterImageLoaderState,
				sourceProperty: 'background-image',
			});
			const rect = getBackgroundImageRect({
				backgroundPosition,
				backgroundSize,
				backgroundRepeat,
				positioningArea,
				intrinsicSize: image,
			});
			if (rect.width === 0 || rect.height === 0) return null;
			const [repeatX, repeatY = repeatX] = backgroundRepeat.split(/\s+/);
			if (repeatX === 'space' || repeatY === 'space') {
				if (
					![repeatX, repeatY].every((value) =>
						['space', 'no-repeat'].includes(value),
					)
				) {
					throw new Error(`Unsupported background-repeat: ${backgroundRepeat}`);
				}

				const xs = getTilePositions({
					repeat: repeatX,
					start: rect.left,
					size: rect.width,
					areaStart: positioningArea.left,
					areaSize: positioningArea.width,
					paintStart: boundingRect.left,
					paintEnd: boundingRect.right,
				});
				const ys = getTilePositions({
					repeat: repeatY,
					start: rect.top,
					size: rect.height,
					areaStart: positioningArea.top,
					areaSize: positioningArea.height,
					paintStart: boundingRect.top,
					paintEnd: boundingRect.bottom,
				});
				return {
					image,
					rects: (function* () {
						for (const x of xs) {
							for (const y of ys)
								yield new DOMRect(x, y, rect.width, rect.height);
						}
					})(),
				};
			}

			const repeatStyle = backgroundRepeat.replace(/round/g, 'repeat');
			const repetition =
				(
					{
						'repeat repeat': 'repeat',
						'no-repeat no-repeat': 'no-repeat',
						'repeat no-repeat': 'repeat-x',
						'no-repeat repeat': 'repeat-y',
					} as Record<string, string>
				)[repeatStyle] ?? repeatStyle;
			if (!['repeat', 'repeat-x', 'repeat-y', 'no-repeat'].includes(repetition))
				throw new Error(`Unsupported background-repeat: ${backgroundRepeat}`);
			// A single round tile with no overflow uses edge-clamped image sampling.
			if (
				repetition === 'no-repeat' ||
				((backgroundRepeat === 'round' || backgroundRepeat === 'round round') &&
					rect.width === positioningArea.width &&
					rect.height === positioningArea.height &&
					rect.left === positioningArea.left &&
					rect.top === positioningArea.top &&
					boundingRect.left === positioningArea.left &&
					boundingRect.top === positioningArea.top &&
					boundingRect.width === positioningArea.width &&
					boundingRect.height === positioningArea.height)
			)
				return {image, rects: [rect]};
			const pattern = contextToDraw.createPattern(image, repetition);
			if (!pattern)
				throw new Error('Could not create raster background pattern');
			pattern.setTransform(
				new DOMMatrix()
					.translate(rect.left - offsetLeft, rect.top - offsetTop)
					.scale(rect.width / image.width, rect.height / image.height),
			);
			return pattern;
		}

		const radialGradientInfo = parseRadialGradient(
			backgroundImage,
			internalState.experimental3DRendering,
		);
		if (radialGradientInfo) {
			const rect = getBackgroundImageRect({
				backgroundPosition,
				backgroundSize,
				positioningArea: boundingRect,
				intrinsicSize: null,
			});
			return createRadialGradientFill({
				gradientInfo: radialGradientInfo,
				experimental3DRendering: internalState.experimental3DRendering,
				contextToDraw,
				rect,
				offsetLeft,
				offsetTop,
			});
		}

		const gradientInfo = parseLinearGradient(
			backgroundImage,
			internalState.experimental3DRendering,
		);
		if (gradientInfo) {
			const backgroundImageRect = getBackgroundImageRect({
				backgroundPosition,
				backgroundSize,
				positioningArea: boundingRect,
				intrinsicSize: null,
			});
			const gradient = createCanvasGradient({
				ctx: contextToDraw,
				rect: backgroundImageRect,
				gradientInfo,
				offsetLeft,
				offsetTop,
			});

			return gradient;
		}
	}

	return null;
};
