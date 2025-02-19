export const calculateLoopDuration = ({
	endAt,
	mediaDuration,
	playbackRate,
	startFrom,
}: {
	mediaDuration: number;
	playbackRate: number;
	startFrom: number | undefined;
	endAt: number | undefined;
}) => {
	let duration = mediaDuration;

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
