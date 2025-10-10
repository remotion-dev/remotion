export const resolvePlaybackTime = ({
	absolutePlaybackTimeInSeconds,
	playbackRate,
	loop,
	trimBeforeInSeconds,
	trimAfterInSeconds,
	mediaDurationInSeconds,
}: {
	absolutePlaybackTimeInSeconds: number;
	playbackRate: number;
	loop: boolean;
	trimBeforeInSeconds: number | undefined;
	trimAfterInSeconds: number | undefined;
	mediaDurationInSeconds: number | undefined;
}) => {
	const loopAfterPreliminary = Math.min(
		trimAfterInSeconds ?? Infinity,
		mediaDurationInSeconds ?? Infinity,
	);
	const loopAfterConsideringTrimBefore =
		loopAfterPreliminary - (trimBeforeInSeconds ?? 0);

	const loopAfterConsideringPlaybackRate =
		loopAfterConsideringTrimBefore / playbackRate;

	if (
		absolutePlaybackTimeInSeconds > loopAfterConsideringPlaybackRate &&
		!loop
	) {
		return loopAfterConsideringPlaybackRate;
	}

	const timeConsideringLoop =
		absolutePlaybackTimeInSeconds % loopAfterConsideringPlaybackRate;

	const timeInSeconds =
		timeConsideringLoop * playbackRate + (trimBeforeInSeconds ?? 0);
	if (Number.isNaN(timeInSeconds)) {
		// eslint-disable-next-line no-console
		console.log({
			absolutePlaybackTimeInSeconds,
			playbackRate,
			loop,
			trimBeforeInSeconds,
			trimAfterInSeconds,
			mediaDurationInSeconds,
		});
		throw new Error('Time is NaN');
	}

	return timeInSeconds;
};
