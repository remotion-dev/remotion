import type {LoopDisplay} from 'remotion';

export const shouldRepeatAudioWaveform = (
	loopDisplay: LoopDisplay | undefined,
): loopDisplay is LoopDisplay => {
	return loopDisplay !== undefined && loopDisplay.numberOfTimes > 1;
};

export const getAudioWaveformLoopWidth = ({
	visualizationWidth,
	loopDisplay,
}: {
	visualizationWidth: number;
	loopDisplay: LoopDisplay | undefined;
}) => {
	if (!shouldRepeatAudioWaveform(loopDisplay)) {
		return visualizationWidth;
	}

	return visualizationWidth / loopDisplay.numberOfTimes;
};
