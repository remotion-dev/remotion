import type {TComposition, z} from 'remotion';

export const isCompositionStill = (comp: TComposition<z.ZodTypeAny> | null) => {
	if (!comp) {
		return false;
	}

	return comp.durationInFrames === 1;
};
