import {preloadAsset} from './preload-asset';

export const preloadAudio = (src: string): (() => void) => {
	return preloadAsset(src, 'audio');
};
