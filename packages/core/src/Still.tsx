import type {StillProps} from './Composition.js';
import {Composition} from './Composition.js';

/**
 * A <Still /> is a <Composition /> that is only 1 frame long.
 * @see [Documentation](https://www.remotion.dev/docs/still)
 */

export const Still = <T,>(props: StillProps<T>) => {
	return <Composition fps={1} durationInFrames={1} {...props} />;
};
