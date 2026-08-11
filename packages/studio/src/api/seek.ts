import {Internals} from 'remotion';

/*
 * @description Jump to a different time in the timeline.
 * @see [Documentation](https://www.remotion.dev/docs/studio/seek)
 */
export const seek = (frame: number) => {
	Internals.timeValueRef.current?.seek(Math.max(0, frame));
};
