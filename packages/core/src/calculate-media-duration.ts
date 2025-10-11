export const calculateMediaDuration = ({
	trimAfter,
	mediaDurationInFrames,
	playbackRate,
	trimBefore,
}: {
	mediaDurationInFrames: number;
	playbackRate: number;
	trimBefore: number | undefined;
	trimAfter: number | undefined;
}) => {
	let duration = mediaDurationInFrames;

	// Account for trimAfter
	if (typeof trimAfter !== 'undefined') {
		duration = trimAfter;
	}

	// Account for trimBefore
	if (typeof trimBefore !== 'undefined') {
		duration -= trimBefore;
	}

	const actualDuration = duration / playbackRate;

	return Math.floor(actualDuration);
};
