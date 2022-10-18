import type {TComposition} from 'remotion';

export const isCompositionStill = (comp: TComposition) => {
	return comp.durationInFrames === 1;
};
