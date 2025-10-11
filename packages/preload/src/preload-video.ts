import {preloadAsset} from './preload-asset';

/*
 * @description Preloads a video in the DOM so that when a video tag is mounted, it can play immediately.
 * @see [Documentation](https://www.remotion.dev/docs/preload/preload-video)
 */
export const preloadVideo = (src: string): (() => void) => {
	return preloadAsset(src, 'video');
};
