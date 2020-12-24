import {useUnsafeVideoConfig} from './use-unsafe-video-config';
import {VideoConfig} from './video-config';

export const useVideoConfig = (): VideoConfig => {
	return useUnsafeVideoConfig() as VideoConfig;
};
