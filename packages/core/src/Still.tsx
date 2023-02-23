import type {StillProps} from './Composition.js';
import {Composition} from './Composition.js';

export const Still = <T,>(props: StillProps<T>) => {
	return <Composition fps={1} durationInFrames={1} {...props} />;
};
