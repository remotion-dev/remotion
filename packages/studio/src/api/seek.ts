/*
 * @description Jump to a different time in the timeline.
 * @see [Documentation](https://www.remotion.dev/docs/studio/seek)
 */

import {Internals} from 'remotion';

export const seek = (frame: number) => {
	Internals.timeValueRef.current?.seek(Math.max(0, frame));
};
