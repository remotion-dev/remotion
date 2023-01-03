import {preloadAsset} from './preload-asset';

export const preloadImage = (src: string): (() => void) => {
	return preloadAsset(src, 'image');
};
