import {Internals} from 'remotion';

export const getTimeInSeconds = ({
	loop,
	mediaDurationInSeconds,
	unloopedTimeInSeconds,
	src,
	trimAfter,
	trimBefore,
	fps,
	playbackRate,
	ifNoMediaDuration,
}: {
	loop: boolean;
	mediaDurationInSeconds: number | null;
	unloopedTimeInSeconds: number;
	src: string;
	trimAfter: number | undefined;
	trimBefore: number | undefined;
	playbackRate: number;
	fps: number;
	ifNoMediaDuration: 'fail' | 'infinity';
}) => {
	if (mediaDurationInSeconds === null && loop && ifNoMediaDuration === 'fail') {
		throw new Error(
			`Could not determine duration of ${src}, but "loop" was set.`,
		);
	}

	const loopDurationInFrames = loop
		? Internals.calculateMediaDuration({
				trimAfter,
				mediaDurationInFrames: mediaDurationInSeconds
					? mediaDurationInSeconds * fps
					: Infinity,
				// Playback rate was already specified before
				playbackRate: 1,
				trimBefore,
			})
		: Infinity;

	const sourceFrames = unloopedTimeInSeconds * playbackRate * fps;
	const loopedFrames = sourceFrames % loopDurationInFrames;
	// At an exact loop boundary, accumulated floating point error can put the
	// remainder just below the loop end and incorrectly display its final frame.
	const roundingTolerance =
		Number.EPSILON * Math.max(1, Math.abs(sourceFrames)) * 4;
	const timeInSeconds = loop
		? (Math.abs(loopDurationInFrames - loopedFrames) < roundingTolerance
				? 0
				: loopedFrames) / fps
		: unloopedTimeInSeconds * playbackRate;

	if ((trimAfter ?? null) !== null && !loop) {
		const time = (trimAfter! - (trimBefore ?? 0)) / fps;

		if (timeInSeconds >= time) {
			return null;
		}
	}

	return timeInSeconds + (trimBefore ?? 0) / fps;
};

export const calculateEndTime = ({
	mediaDurationInSeconds,
	ifNoMediaDuration,
	src,
	trimAfter,
	trimBefore,
	fps,
}: {
	mediaDurationInSeconds: number | null;
	ifNoMediaDuration: 'fail' | 'infinity';
	src: string;
	trimAfter: number | undefined;
	trimBefore: number | undefined;
	fps: number;
}) => {
	if (mediaDurationInSeconds === null && ifNoMediaDuration === 'fail') {
		throw new Error(
			`Could not determine duration of ${src}, but "loop" was set.`,
		);
	}

	const mediaDuration =
		Internals.calculateMediaDuration({
			trimAfter,
			mediaDurationInFrames: mediaDurationInSeconds
				? mediaDurationInSeconds * fps
				: Infinity,
			// Playback rate was already specified before
			playbackRate: 1,
			trimBefore,
		}) / fps;

	return mediaDuration + (trimBefore ?? 0) / fps;
};
