export const clampInspectorKeyframeDisplayFrame = ({
	durationInFrames,
	frame,
}: {
	readonly durationInFrames: number;
	readonly frame: number;
}) => {
	if (durationInFrames <= 0) {
		return 0;
	}

	return Math.min(Math.max(Math.round(frame), 0), durationInFrames - 1);
};

export const getInspectorKeyframeSourceFrame = ({
	displayFrame,
	keyframeDisplayOffset,
}: {
	readonly displayFrame: number;
	readonly keyframeDisplayOffset: number;
}) => {
	return displayFrame - keyframeDisplayOffset;
};
