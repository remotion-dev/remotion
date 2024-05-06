import {useContext} from 'react';
import {SequenceContext} from '../SequenceContext.js';
import {Loop} from '../loop/index.js';
import {useCurrentFrame} from '../use-current-frame.js';

export const useMediaStartsAt = () => {
	const parentSequence = useContext(SequenceContext);
	const startsAt = Math.min(0, parentSequence?.relativeFrom ?? 0);
	return startsAt;
};

export type LoopVolumeCurveBehavior = 'repeat' | 'extend';

/**
 * When passing a function as the prop for `volume`,
 * we calculate the way more intuitive value for currentFrame
 */
export const useFrameForVolumeProp = (behavior: LoopVolumeCurveBehavior) => {
	const loop = Loop.useLoop();
	const frame = useCurrentFrame();
	const startsAt = useMediaStartsAt();
	if (behavior === 'repeat' || loop === null) {
		return frame + startsAt;
	}

	return frame + startsAt + loop.durationInFrames * loop.iteration;
};
