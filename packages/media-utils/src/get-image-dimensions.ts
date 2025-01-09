import {pLimit} from './p-limit';
import type {ImageDimensions} from './types';

const imageDimensionsCache: {[key: string]: ImageDimensions} = {};

const limit = pLimit(3);

const fn = async (src: string): Promise<ImageDimensions> => {
	if (imageDimensionsCache[src]) {
		return imageDimensionsCache[src];
	}

	if (typeof document === 'undefined') {
		throw new Error('getImageDimensions() is only available in the browser.');
	}

	const imageDimensions = await new Promise<ImageDimensions>(
		(resolved, reject) => {
			const image = new Image();

			image.onload = () => {
				const {width, height} = image;
				resolved({width, height});
			};

			image.onerror = reject;

			image.src = src;
		},
	);

	imageDimensionsCache[src] = imageDimensions;
	return imageDimensions;
};

/*
 * @description Takes an image src, retrieves the dimensions of an image.
 * @see [Documentation](https://remotion.dev/docs/get-image-dimensions)
 */
export function getImageDimensions(src: string): Promise<ImageDimensions> {
	return limit(fn, src);
}
