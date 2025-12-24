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

	const loopDuration = loop
		? Internals.calculateMediaDuration({
				trimAfter,
				mediaDurationInFrames: mediaDurationInSeconds
					? mediaDurationInSeconds * fps
					: Infinity,
				// Playback rate was already specified before
				playbackRate: 1,
				trimBefore,
			}) / fps
		: Infinity;

	const timeInSeconds = (unloopedTimeInSeconds * playbackRate) % loopDuration;

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
