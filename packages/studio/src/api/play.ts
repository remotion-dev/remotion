import type {SyntheticEvent} from 'react';
import {Internals} from 'remotion';

/*
 * @description Play the current composition.
 * @see [Documentation](https://www.remotion.dev/docs/studio/play)
 */
export const play = (e?: SyntheticEvent | PointerEvent) => {
	Internals.timeValueRef.current?.play(e);
};
