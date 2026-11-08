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
	CanvasGradient | CanvasPattern | {image: ImageBitmap; rect: DOMRect} | null
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
				positioningArea,
				intrinsicSize: image,
			});
			if (rect.width === 0 || rect.height === 0) return null;
			const repetition =
				(
					{
						'repeat repeat': 'repeat',
						'no-repeat no-repeat': 'no-repeat',
						'repeat no-repeat': 'repeat-x',
						'no-repeat repeat': 'repeat-y',
					} as Record<string, string>
				)[backgroundRepeat] ?? backgroundRepeat;
			if (!['repeat', 'repeat-x', 'repeat-y', 'no-repeat'].includes(repetition))
				throw new Error(`Unsupported background-repeat: ${backgroundRepeat}`);
			if (repetition === 'no-repeat') return {image, rect};
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
