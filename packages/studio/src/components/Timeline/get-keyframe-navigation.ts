export const getPreviousKeyframeDisplayFrame = (
	keyframes: readonly {frame: number}[],
	currentDisplayFrame: number,
): number | null => {
	let previous: number | null = null;
	for (const keyframe of keyframes) {
		if (keyframe.frame < currentDisplayFrame) {
			previous = keyframe.frame;
		}
	}

	return previous;
};

export const getNextKeyframeDisplayFrame = (
	keyframes: readonly {frame: number}[],
	currentDisplayFrame: number,
): number | null => {
	for (const keyframe of keyframes) {
		if (keyframe.frame > currentDisplayFrame) {
			return keyframe.frame;
		}
	}

	return null;
};

export const hasKeyframeAtSourceFrame = (
	keyframes: readonly {frame: number}[],
	sourceFrame: number,
): boolean => {
	return keyframes.some((keyframe) => keyframe.frame === sourceFrame);
};
