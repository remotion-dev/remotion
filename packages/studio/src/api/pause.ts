import {Internals} from 'remotion';

/*
 * @description Pause the current composition.
 * @see [Documentation](https://www.remotion.dev/docs/studio/pause)
 */
export const pause = () => {
	Internals.timeValueRef.current?.pause();
};
