import {useContext} from 'react';
import {SequenceContext} from '../sequencing';
import {useCurrentFrame} from '../use-frame';

export const useAudioFrame = () => {
	const frame = useCurrentFrame();
	const parentSequence = useContext(SequenceContext);

	const startsAt = Math.min(0, parentSequence?.relativeFrom ?? 0);
	return frame + startsAt;
};
