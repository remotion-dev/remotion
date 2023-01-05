import type {StillProps} from './Composition';
import {Composition} from './Composition';

export const Still = <T extends object>(props: StillProps<T>) => {
	return <Composition fps={1} durationInFrames={1} {...props} />;
};
