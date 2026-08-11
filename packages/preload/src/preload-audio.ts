import {preloadAsset} from './preload-asset';

/*
 * @description Preloads audio in the DOM so that when an audio tag is mounted, it can play immediately.
 * @see [Documentation](https://www.remotion.dev/docs/preload/preload-audio)
 */
export const preloadAudio = (src: string): (() => void) => {
	return preloadAsset(src, 'audio');
};
