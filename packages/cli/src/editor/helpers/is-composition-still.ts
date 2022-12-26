import type {TComposition} from 'remotion';

export const isCompositionStill = (comp: TComposition | null) => {
	if (!comp) {
		return false;
	}

	return comp.durationInFrames === 1;
};
