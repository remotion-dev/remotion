import type {z} from 'zod';
import type {StillProps} from './Composition.js';
import {Composition} from './Composition.js';

/**
 * @description A <Still /> is a <Composition /> that is only 1 frame long.
 * @see [Documentation](https://www.remotion.dev/docs/still)
 */

export const Still = <T extends z.ZodTypeAny, Props>(
	props: StillProps<T, Props>
) => {
	return <Composition fps={1} durationInFrames={1} {...props} />;
};
