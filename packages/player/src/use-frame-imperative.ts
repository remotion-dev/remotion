import {useCallback, useRef} from 'react';
import {Internals} from 'remotion';

export type GetCurrentFrame = () => number;

export const useFrameImperative = (): GetCurrentFrame => {
	const frame = Internals.Timeline.useTimelinePosition();

	const frameRef = useRef<number>(frame);
	frameRef.current = frame;

	const getCurrentFrame = useCallback(() => {
		return frameRef.current;
	}, []);

	return getCurrentFrame;
};
