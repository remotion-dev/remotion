import {getVideoConfig} from './register-video';
import {VideoConfig} from './video-config';

export const useVideoConfig = (): VideoConfig => {
	return getVideoConfig();
};
