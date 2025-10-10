import {useContext, useMemo} from 'react';
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
	mediaDurationInSeconds: number;
	trimAfter: number | undefined;
	trimBefore: number | undefined;
	playbackRate: number;
}): _InternalTypes['LoopDisplay'] | undefined => {
	const {durationInFrames: compDuration, fps} = useVideoConfig();
	const context = useContext(Internals.SequenceContext);

	const durationInFrames = Internals.calculateLoopDuration({
		mediaDurationInFrames: mediaDurationInSeconds * fps,
		playbackRate,
		trimAfter,
		trimBefore,
	});

	const from = context?.relativeFrom ?? 0;

	const maxTimes = Math.ceil(compDuration / durationInFrames);

	const loopDisplay: _InternalTypes['LoopDisplay'] | undefined = useMemo(() => {
		if (!loop) {
			return undefined;
		}

		return {
			numberOfTimes: maxTimes,
			startOffset: -from + (trimBefore ?? 0),
			durationInFrames,
		};
	}, [loop, maxTimes, from, trimBefore, durationInFrames]);

	return loopDisplay;
};
