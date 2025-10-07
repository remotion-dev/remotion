export const calculateLoopDuration = ({
	endAt,
	mediaDurationInFrames,
	playbackRate,
	startFrom,
}: {
	mediaDurationInFrames: number;
	playbackRate: number;
	startFrom: number | undefined;
	endAt: number | undefined;
}) => {
	let duration = mediaDurationInFrames;

	// Account for endAt
	if (typeof endAt !== 'undefined') {
		duration = endAt;
	}

	// Account for startFrom
	if (typeof startFrom !== 'undefined') {
		duration -= startFrom;
	}

	const actualDuration = duration / playbackRate;

	return Math.floor(actualDuration);
};
