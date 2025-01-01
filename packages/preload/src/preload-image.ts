import {preloadAsset} from './preload-asset';

/*
 * @description Preloads an image so that when an <Img> tag is mounted, it can display immediately.
 * @see [Documentation](https://www.remotion.dev/docs/preload/preload-image)
 */
export const preloadImage = (src: string): (() => void) => {
	return preloadAsset(src, 'image');
};
