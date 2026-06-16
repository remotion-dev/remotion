import {shouldTileLoopDisplay} from '@remotion/timeline-utils';
import type {LoopDisplay} from 'remotion';

export type TimelineVideoFilmstripTimes =
	| {
			type: 'frozen';
			timestampInSeconds: number;
	  }
	| {
			type: 'range';
			fromSeconds: number;
			toSeconds: number;
	  };

export const getTimelineVideoFilmstripTimes = ({
	trimBefore,
	durationInFrames,
	playbackRate,
	fps,
	loopDisplay,
	frozenMediaFrame,
}: {
	trimBefore: number;
	durationInFrames: number;
	playbackRate: number;
	fps: number;
	loopDisplay: LoopDisplay | undefined;
	frozenMediaFrame: number | null;
}): TimelineVideoFilmstripTimes => {
	if (frozenMediaFrame !== null) {
		return {
			type: 'frozen',
			timestampInSeconds: Math.max(0, frozenMediaFrame / fps),
		};
	}

	const fromSeconds = trimBefore / fps;
	const visibleDurationInFrames =
		shouldTileLoopDisplay(loopDisplay) && loopDisplay
			? loopDisplay.durationInFrames
			: durationInFrames;

	return {
		type: 'range',
		fromSeconds,
		toSeconds: fromSeconds + (visibleDurationInFrames * playbackRate) / fps,
	};
};
