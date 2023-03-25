import type {AnyComposition} from 'remotion';

export const isCompositionStill = (comp: AnyComposition | null) => {
	if (!comp) {
		return false;
	}

	return comp.durationInFrames === 1;
};
