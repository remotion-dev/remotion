import type {InternalState} from '../internal-state';
import type {MaskImageInfo} from './mask-image';
import {createNativeMaskSvg} from './native-mask-svg';
import {getRasterImageDataUrl} from './raster-image-loader';
import {turnSvgIntoDrawable} from './turn-svg-into-drawable';

export const createCssMask = async ({
	maskImageInfo,
	maskRect,
	precomposeRect,
	width,
	height,
	scale,
	internalState,
}: {
	maskImageInfo: Extract<MaskImageInfo, {type: 'layers'}>;
	maskRect: DOMRect;
	precomposeRect: DOMRect;
	width: number;
	height: number;
	scale: number;
	internalState: InternalState;
}) => {
	const images = await Promise.all(
		maskImageInfo.layers.map(async (layer) => {
			if (layer === null) return 'none';
			if (layer.type === 'gradient') return layer.value;
			const src = await getRasterImageDataUrl({
				src: layer.src,
				sourceProperty: 'mask-image',
				state: internalState.rasterImageLoaderState,
			});
			return `url("${src}")`;
		}),
	);
	const {svg, target} = createNativeMaskSvg({
		ownerDocument: document,
		maskRect,
		precomposeRect,
		referenceRect: maskRect,
		width,
		height,
		scale,
	});
	Object.assign(target.style, maskImageInfo.style, {
		maskImage: images.join(', '),
	});
	return turnSvgIntoDrawable(svg);
};
