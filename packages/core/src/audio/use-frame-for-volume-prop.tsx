import {useCurrentFrame} from '../use-frame';
import {useMediaStartsAt} from './use-media-starts-at';

/**
 * When passing a function as the prop for `volume`,
 * we calculate the way more intuitive value for currentFrame
 */
export const useFrameForVolumeProp = () => {
	const frame = useCurrentFrame();
	const startsAt = useMediaStartsAt();
	return frame + startsAt;
};
