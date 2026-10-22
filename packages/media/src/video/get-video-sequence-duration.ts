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

export const getVideoSequenceDuration = ({
	durationInFrames,
	loop,
	playbackRate,
	trimAfter,
	trimBefore,
}: {
	readonly durationInFrames: number | undefined;
	readonly loop: boolean;
	readonly playbackRate: number;
	readonly trimAfter: number | undefined;
	readonly trimBefore: number | undefined;
}) => {
	if (loop) {
		return undefined;
	}

	const trimDuration =
		trimAfter === undefined ? Infinity : trimAfter - (trimBefore ?? 0);
	const contentDuration = Math.min(durationInFrames ?? Infinity, trimDuration);
	return contentDuration === Infinity
		? undefined
		: contentDuration / playbackRate;
};
