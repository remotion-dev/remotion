export const resolveSequenceContentDuration = ({
	durationInFrames,
}: {
	durationInFrames: number | undefined;
}): number => {
	return durationInFrames ?? Infinity;
};

// Length of an item in its parent timeline. `durationInFrames` is measured in
// the child clock.
export const resolveSequenceDuration = ({
	durationInFrames,
	playbackRate,
	loop,
}: {
	durationInFrames: number | undefined;
	playbackRate: number | undefined;
	loop: boolean | undefined;
}): number => {
	if (loop) {
		return Infinity;
	}

	return (
		resolveSequenceContentDuration({
			durationInFrames,
		}) / (playbackRate ?? 1)
	);
};
