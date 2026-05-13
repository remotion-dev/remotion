export type TimelineLoopDisplay = {
	durationInFrames: number;
	numberOfTimes: number;
	startOffset: number;
};

export const shouldTileLoopDisplay = (
	loopDisplay: TimelineLoopDisplay | undefined,
): loopDisplay is TimelineLoopDisplay => {
	return loopDisplay !== undefined && loopDisplay.numberOfTimes > 1;
};

export const getLoopDisplayWidth = ({
	visualizationWidth,
	loopDisplay,
}: {
	visualizationWidth: number;
	loopDisplay: TimelineLoopDisplay | undefined;
}) => {
	if (!shouldTileLoopDisplay(loopDisplay)) {
		return visualizationWidth;
	}

	return visualizationWidth / loopDisplay.numberOfTimes;
};
