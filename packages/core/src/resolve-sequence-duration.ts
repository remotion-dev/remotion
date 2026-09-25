// Length of an item in its parent timeline. `trimAfter` is measured in the
// child clock, so it only bounds the duration once converted by `playbackRate`.
// A looped item repeats the trimmed range, so only `durationInFrames` caps it.
export const resolveSequenceDuration = ({
	durationInFrames,
	trimBefore,
	trimAfter,
	playbackRate,
	loop,
}: {
	durationInFrames: number | undefined;
	trimBefore: number | undefined;
	trimAfter: number | undefined;
	playbackRate: number | undefined;
	loop: boolean | undefined;
}): number => {
	const duration = durationInFrames ?? Infinity;
	if (loop || trimAfter === undefined) {
		return duration;
	}

	return Math.min(
		duration,
		(trimAfter - (trimBefore ?? 0)) / (playbackRate ?? 1),
	);
};
