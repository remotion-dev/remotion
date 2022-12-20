import {preloadAsset} from './preload-asset';

export const preloadVideo = (src: string): (() => void) => {
	return preloadAsset(src, 'video');
};
