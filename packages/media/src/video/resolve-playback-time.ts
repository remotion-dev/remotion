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
	const loopAfterPreliminary = loop
		? Math.min(
				trimAfterInSeconds ?? Infinity,
				mediaDurationInSeconds ?? Infinity,
			)
		: Infinity;
	const loopAfterConsideringTrimBefore =
		loopAfterPreliminary - (trimBeforeInSeconds ?? 0);

	const loopAfterConsideringPlaybackRate =
		loopAfterConsideringTrimBefore / playbackRate;

	const timeConsideringLoop =
		absolutePlaybackTimeInSeconds % loopAfterConsideringPlaybackRate;

	const time = timeConsideringLoop * playbackRate + (trimBeforeInSeconds ?? 0);
	if (Number.isNaN(time)) {
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

	return time;
};
