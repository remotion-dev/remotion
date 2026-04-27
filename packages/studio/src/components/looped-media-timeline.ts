import type {LoopDisplay} from 'remotion';

export const shouldTileLoopDisplay = (
	loopDisplay: LoopDisplay | undefined,
): loopDisplay is LoopDisplay => {
	return loopDisplay !== undefined && loopDisplay.numberOfTimes > 1;
};

export const getLoopDisplayWidth = ({
	visualizationWidth,
	loopDisplay,
}: {
	visualizationWidth: number;
	loopDisplay: LoopDisplay | undefined;
}) => {
	if (!shouldTileLoopDisplay(loopDisplay)) {
		return visualizationWidth;
	}

	return visualizationWidth / loopDisplay.numberOfTimes;
};
