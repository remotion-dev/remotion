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
	internalState,
}: {
	maskImageInfo: Extract<MaskImageInfo, {type: 'layers'}>;
	maskRect: DOMRect;
	precomposeRect: DOMRect;
	width: number;
	height: number;
	internalState: InternalState;
}) => {
	const images = await Promise.all(
		maskImageInfo.layers.map(async (layer) => {
			if (layer === null) return 'none';
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
	});
	Object.assign(target.style, maskImageInfo.style, {
		maskImage: images.join(', '),
	});
	return turnSvgIntoDrawable(svg);
};
