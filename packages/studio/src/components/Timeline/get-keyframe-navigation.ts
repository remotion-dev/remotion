const isKeyframeInTimelineRange = (
	frame: number,
	durationInFrames: number,
): boolean => {
	return frame >= 0 && frame < durationInFrames;
};

export const getPreviousKeyframeDisplayFrame = (
	keyframes: readonly {frame: number}[],
	currentDisplayFrame: number,
	durationInFrames: number,
): number | null => {
	let previous: number | null = null;
	for (const keyframe of keyframes) {
		if (
			isKeyframeInTimelineRange(keyframe.frame, durationInFrames) &&
			keyframe.frame < currentDisplayFrame &&
			(previous === null || keyframe.frame > previous)
		) {
			previous = keyframe.frame;
		}
	}

	return previous;
};

export const getNextKeyframeDisplayFrame = (
	keyframes: readonly {frame: number}[],
	currentDisplayFrame: number,
	durationInFrames: number,
): number | null => {
	let next: number | null = null;
	for (const keyframe of keyframes) {
		if (
			isKeyframeInTimelineRange(keyframe.frame, durationInFrames) &&
			keyframe.frame > currentDisplayFrame &&
			(next === null || keyframe.frame < next)
		) {
			next = keyframe.frame;
		}
	}

	return next;
};

export const hasKeyframeAtSourceFrame = (
	keyframes: readonly {frame: number}[],
	sourceFrame: number,
): boolean => {
	return keyframes.some((keyframe) => keyframe.frame === sourceFrame);
};
