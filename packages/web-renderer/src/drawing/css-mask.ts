import type {InternalState} from '../internal-state';
import type {MaskImageInfo} from './mask-image';
import {createNativeMaskSvg} from './native-mask-svg';
import {getRasterImageDataUrl, readBlobAsDataUrl} from './raster-image-loader';
import {turnSvgIntoDrawable} from './turn-svg-into-drawable';

export const createCssMask = async ({
	maskImageInfo,
	content,
	maskRect,
	precomposeRect,
	width,
	height,
	internalState,
}: {
	maskImageInfo: Extract<MaskImageInfo, {type: 'layers'}>;
	content: OffscreenCanvas;
	maskRect: DOMRect;
	precomposeRect: DOMRect;
	width: number;
	height: number;
	internalState: InternalState;
}) => {
	const images = await Promise.all(
		maskImageInfo.layers.map(async (layer) => {
			if (layer === null) return 'none';
			if (layer.type === 'linear-gradient') return layer.value;
			const src = await getRasterImageDataUrl({
				src: layer.src,
				sourceProperty: 'mask-image',
				state: internalState.rasterImageLoaderState,
			});
			return `url("${src}")`;
		}),
	);

	const source = document.createElement('img');
	const {signal} = internalState.rasterImageLoaderState;
	const abort = () => source.removeAttribute('src');
	signal?.addEventListener('abort', abort, {once: true});
	try {
		source.src = await readBlobAsDataUrl({
			blob: await content.convertToBlob({type: 'image/png'}),
			signal: internalState.rasterImageLoaderState.signal,
		});
		if (signal?.aborted) throw new Error('Aborted');
		await source.decode();
		if (signal?.aborted) throw new Error('Aborted');
		Object.assign(source.style, {
			position: 'absolute',
			left: `${precomposeRect.left - maskRect.left}px`,
			top: `${precomposeRect.top - maskRect.top}px`,
			width: `${precomposeRect.width}px`,
			height: `${precomposeRect.height}px`,
		});
		const {svg, target} = createNativeMaskSvg({
			ownerDocument: document,
			maskRect,
			precomposeRect,
			referenceRect: maskRect,
			width,
			height,
		});
		target.replaceChildren(source);
		Object.assign(target.style, maskImageInfo.style, {
			maskImage: images.join(', '),
		});

		const drawable = await turnSvgIntoDrawable(svg);
		if (signal?.aborted) throw new Error('Aborted');
		return drawable;
	} finally {
		signal?.removeEventListener('abort', abort);
		source.removeAttribute('src');
	}
};
