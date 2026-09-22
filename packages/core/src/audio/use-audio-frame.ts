import {createContext, useContext} from 'react';
import {Loop} from '../loop/index.js';
import {SequenceContext} from '../SequenceContext.js';
import {useCurrentFrame} from '../use-current-frame.js';

// A media trim is a source-frame offset, unlike elapsed time inherited from a Sequence.
export const Html5MediaTrimContext = createContext(0);

export const useMediaStartsAt = () => {
	const parentSequence = useContext(SequenceContext);
	return parentSequence?.cumulatedNegativeFrom ?? 0;
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
