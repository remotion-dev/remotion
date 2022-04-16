import {useContext} from 'react';
import {SequenceContext} from '../sequencing';

export const useMediaStartsAt = () => {
	const parentSequence = useContext(SequenceContext);
	const startsAt = Math.min(0, parentSequence?.relativeFrom ?? 0);
	return startsAt;
};
