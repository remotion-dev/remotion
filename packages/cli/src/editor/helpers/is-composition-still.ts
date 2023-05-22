export const isCompositionStill = (comp: {durationInFrames: number} | null) => {
	if (!comp) {
		return false;
	}

	return comp.durationInFrames === 1;
};
