export const getSequenceBoundaryTolerance = ({
	absoluteFrame,
	cumulatedFrom,
	from,
	parentPlaybackRate,
	durationInFrames,
}: {
	absoluteFrame: number;
	cumulatedFrom: number;
	from: number;
	parentPlaybackRate: number;
	durationInFrames: number;
}): number => {
	// Nested rates can put exact boundaries a few floating-point units apart.
	return Math.min(
		durationInFrames / 2,
		Number.EPSILON *
			Math.max(
				Math.abs(absoluteFrame * parentPlaybackRate),
				Math.abs(cumulatedFrom * parentPlaybackRate),
				Math.abs(from),
			) *
			4,
	);
};
