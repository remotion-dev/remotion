export const isCompositionStill = (
	comp: {durationInFrames: number | undefined} | null,
) => {
	if (!comp) {
		return false;
	}

	return comp.durationInFrames === 1;
};
