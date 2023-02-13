import {preloadAsset} from './preload-asset';

export const preloadFont = (src: string): (() => void) => {
	return preloadAsset(src, 'font');
};
