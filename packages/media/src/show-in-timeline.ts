import {useMemo} from 'react';
import type {LoopDisplay} from 'remotion';
import {Internals, useVideoConfig} from 'remotion';

export const useLoopDisplay = ({
	loop,
	mediaDurationInSeconds,
	playbackRate,
	trimAfter,
	trimBefore,
}: {
	loop: boolean;
	mediaDurationInSeconds: number | null;
	trimAfter: number | undefined;
	trimBefore: number | undefined;
	playbackRate: number;
}): LoopDisplay | undefined => {
	const {durationInFrames: compDuration, fps} = useVideoConfig();

	const loopDisplay: LoopDisplay | undefined = useMemo(() => {
		if (!loop || !mediaDurationInSeconds) {
			return undefined;
		}

		const durationInFrames = Internals.calculateMediaDuration({
			mediaDurationInFrames: mediaDurationInSeconds * fps,
			playbackRate,
			trimAfter,
			trimBefore,
		});

		const maxTimes = compDuration / durationInFrames;

		return {
			numberOfTimes: maxTimes,
			startOffset: 0,
			durationInFrames,
		};
	}, [
		compDuration,
		fps,
		loop,
		mediaDurationInSeconds,
		playbackRate,
		trimAfter,
		trimBefore,
	]);

	return loopDisplay;
};
