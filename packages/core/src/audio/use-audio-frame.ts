import {useContext} from 'react';
import {SequenceContext} from '../Sequence';
import {useCurrentFrame} from '../use-current-frame';

export const useMediaStartsAt = () => {
	const parentSequence = useContext(SequenceContext);
	const startsAt = Math.min(0, parentSequence?.relativeFrom ?? 0);
	return startsAt;
};

/**
 * When passing a function as the prop for `volume`,
 * we calculate the way more intuitive value for currentFrame
 */
export const useFrameForVolumeProp = () => {
	const frame = useCurrentFrame();
	const startsAt = useMediaStartsAt();
	return frame + startsAt;
};
