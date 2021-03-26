export const getAudioRangeFromStartFromAndDuration = ({
	startFrom,
	durationInFrames,
}: {
	startFrom: number;
	durationInFrames: number;
}) => {
	const negativeOffset = Math.min(startFrom, 0);
	return {
		startFrom: -negativeOffset,
		durationInFrames: durationInFrames + negativeOffset,
	};
};
