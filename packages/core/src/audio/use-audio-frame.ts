import {useContext} from 'react';
import {SequenceContext} from '../sequencing';
import {useCurrentFrame} from '../use-frame';

export const useAudioStartsAt = () => {
	const parentSequence = useContext(SequenceContext);
	const startsAt = Math.min(0, parentSequence?.relativeFrom ?? 0);
	return startsAt;
};

export const useAudioFrame = () => {
	const frame = useCurrentFrame();
	const startsAt = useAudioStartsAt();
	return frame + startsAt;
};
