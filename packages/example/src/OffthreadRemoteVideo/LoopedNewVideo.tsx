import {Video} from '@remotion/media';
import {Composition} from 'remotion';
import {calculateMetadataFn} from './LoopedNewVideo-calculate-metadata';

const src = 'https://remotion.media/video-1m.mp4';

export const Component = () => {
	return <Video src={src} trimBefore={90} trimAfter={60 * 30} loop />;
};

export const LoopedNewVideo = () => {
	return (
		<Composition
			component={Component}
			id="LoopedNewVideo"
			calculateMetadata={calculateMetadataFn}
		/>
	);
};

// In Root.tsx:
// <LoopedNewVideo />
