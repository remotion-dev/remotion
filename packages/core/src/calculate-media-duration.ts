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

	return duration / playbackRate;
};

export const getMediaTrimAfter = ({
	durationInFrames,
	trimAfter,
	trimBefore,
}: {
	readonly durationInFrames: number | undefined;
	readonly trimAfter: number | undefined;
	readonly trimBefore: number | undefined;
}) => {
	const durationAsTrimAfter =
		durationInFrames === undefined
			? undefined
			: (trimBefore ?? 0) + durationInFrames;
	if (durationAsTrimAfter === undefined) {
		return trimAfter;
	}

	return trimAfter === undefined
		? durationAsTrimAfter
		: Math.min(trimAfter, durationAsTrimAfter);
};
