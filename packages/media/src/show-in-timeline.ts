import type {LoopDisplay} from 'remotion';
import {Internals} from 'remotion';

export const getLoopDisplay = ({
	loop,
	mediaDurationInSeconds,
	playbackRate,
	trimAfter,
	trimBefore,
	sequenceDurationInFrames,
	compFps,
}: {
	loop: boolean;
	mediaDurationInSeconds: number | null;
	trimAfter: number | undefined;
	trimBefore: number | undefined;
	sequenceDurationInFrames: number;
	playbackRate: number;
	compFps: number;
}): LoopDisplay | undefined => {
	if (!loop || !mediaDurationInSeconds) {
		return undefined;
	}

	const durationInFrames = Internals.calculateMediaDuration({
		mediaDurationInFrames: mediaDurationInSeconds * compFps,
		playbackRate,
		trimAfter,
		trimBefore,
	});

	const maxTimes = sequenceDurationInFrames / durationInFrames;

	return {
		numberOfTimes: maxTimes,
		startOffset: 0,
		durationInFrames,
	};
};
