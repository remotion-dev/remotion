import {useMemo} from 'react';
import type {_InternalTypes} from 'remotion';
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
}): _InternalTypes['LoopDisplay'] | undefined => {
	const {durationInFrames: compDuration, fps} = useVideoConfig();

	const loopDisplay: _InternalTypes['LoopDisplay'] | undefined = useMemo(() => {
		if (!loop || !mediaDurationInSeconds) {
			return undefined;
		}

		const durationInFrames = Internals.calculateLoopDuration({
			mediaDurationInFrames: mediaDurationInSeconds * fps,
			playbackRate,
			trimAfter,
			trimBefore,
		});

		const maxTimes = Math.ceil(compDuration / durationInFrames);

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
