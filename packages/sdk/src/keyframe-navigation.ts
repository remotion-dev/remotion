const isKeyframeInTimelineRange = (
	frame: number,
	durationInFrames: number,
): boolean => {
	return frame >= 0 && frame < durationInFrames;
};

// Keyframes can sit on fractional display frames, for example when a
// <Sequence playbackRate={2}> maps source frame 15 to display frame 7.5.
// The playhead must stay on whole frames, so navigation snaps to the closest
// whole frame in the direction of travel.
const getLastFrame = (durationInFrames: number) =>
	Math.max(0, Math.ceil(durationInFrames) - 1);

export const getPreviousKeyframeDisplayFrame = (
	keyframes: readonly {frame: number}[],
	currentDisplayFrame: number,
	durationInFrames: number,
): number | null => {
	let previous: number | null = null;
	for (const keyframe of keyframes) {
		if (!isKeyframeInTimelineRange(keyframe.frame, durationInFrames)) {
			continue;
		}

		const frame = Math.min(
			Math.floor(keyframe.frame),
			getLastFrame(durationInFrames),
		);
		if (
			frame < currentDisplayFrame &&
			(previous === null || frame > previous)
		) {
			previous = frame;
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
		if (!isKeyframeInTimelineRange(keyframe.frame, durationInFrames)) {
			continue;
		}

		const frame = Math.min(
			Math.ceil(keyframe.frame),
			getLastFrame(durationInFrames),
		);
		if (frame > currentDisplayFrame && (next === null || frame < next)) {
			next = frame;
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
