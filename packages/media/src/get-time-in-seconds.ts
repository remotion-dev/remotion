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
}: {
	loop: boolean;
	mediaDurationInSeconds: number | null;
	unloopedTimeInSeconds: number;
	src: string;
	trimAfter: number | undefined;
	trimBefore: number | undefined;
	playbackRate: number;
	fps: number;
}) => {
	if (mediaDurationInSeconds === null && loop) {
		throw new Error(
			`Could not determine duration of ${src}, but "loop" was set.`,
		);
	}

	const loopDuration = loop
		? Internals.calculateMediaDuration({
				trimAfter,
				mediaDurationInFrames: mediaDurationInSeconds! * fps,
				// Playback rate was already specified before
				playbackRate: 1,
				trimBefore,
			}) / fps
		: Infinity;

	const timeInSeconds = (unloopedTimeInSeconds * playbackRate) % loopDuration;

	if ((trimAfter ?? null) !== null) {
		if (!loop) {
			const time = (trimAfter! - (trimBefore ?? 0)) / fps;

			if (timeInSeconds >= time) {
				return null;
			}
		}
	}

	return timeInSeconds + (trimBefore ?? 0) / fps;
};
