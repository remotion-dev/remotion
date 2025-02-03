/*
 * @description Jump to a different time in the timeline.
 * @see [Documentation](https://www.remotion.dev/docs/studio/seek)
 */

import {timeValueRef} from '../components/TimeValue';

export const seek = (frame: number) => {
	timeValueRef.current?.seek(Math.max(0, frame));
};
