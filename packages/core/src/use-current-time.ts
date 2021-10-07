import {useCurrentFrame} from './use-frame';
import {useVideoConfig} from './use-video-config';

export const useCurrentTime = (): number => {
	const {fps} = useVideoConfig();
	const currentFrame = useCurrentFrame();

	return 1000 * (currentFrame / fps);
};
