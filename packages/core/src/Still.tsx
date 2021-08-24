import {Composition, StillProps} from './Composition';

export const Still = <T,>(props: StillProps<T>) => {
	return <Composition fps={1} durationInFrames={1} {...props} />;
};
