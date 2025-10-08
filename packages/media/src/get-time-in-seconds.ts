import {Internals} from 'remotion';

export const getTimeInSeconds = ({
	loop,
	mediaDurationInSeconds,
	unloopedTimeInSeconds,
	src,
	endAt,
	startFrom,
	fps,
}: {
	loop: boolean;
	mediaDurationInSeconds: number | null;
	unloopedTimeInSeconds: number;
	src: string;
	endAt: number | undefined;
	startFrom: number | undefined;
	playbackRate: number;
	fps: number;
}) => {
	if (mediaDurationInSeconds === null && loop) {
		throw new Error(
			`Could not determine duration of ${src}, but "loop" was set.`,
		);
	}

	const loopDuration = loop
		? Internals.calculateLoopDuration({
				endAt,
				mediaDurationInFrames: mediaDurationInSeconds! * fps,
				// Playback rate was already specified before
				playbackRate: 1,
				startFrom,
			}) / fps
		: Infinity;

	const timeInSeconds = unloopedTimeInSeconds % loopDuration;

	return timeInSeconds + (startFrom ?? 0) / fps;
};
