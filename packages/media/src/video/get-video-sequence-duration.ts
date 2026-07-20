import {Internals} from 'remotion';

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
	if (loop || trimAfter === undefined) {
		return durationInFrames;
	}

	const trimmedDuration = Internals.calculateMediaDuration({
		trimAfter,
		trimBefore,
		playbackRate,
		mediaDurationInFrames: Infinity,
	});

	return Math.min(durationInFrames ?? Infinity, trimmedDuration);
};
