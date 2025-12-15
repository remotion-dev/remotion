import {useCallback} from 'react';
import {Internals} from 'remotion';

export type GetCurrentFrame = () => number;

export const useFrameImperative = (): GetCurrentFrame => {
	const frameRef = Internals.Timeline.useTimelineFrameRef();

	const getCurrentFrame = useCallback(() => {
		return frameRef.current;
	}, [frameRef]);

	return getCurrentFrame;
};
