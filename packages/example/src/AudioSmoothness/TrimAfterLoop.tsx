import {Video} from '@remotion/media';
import React from 'react';
import {Composition} from 'remotion';
import {calculateMetadataFn} from './NewVideo';

const src = 'https://remotion.media/video.mp4';

const Component: React.FC = () => {
	return <Video src={src} trimAfter={30} loop debugOverlay />;
};

export const AudioSmoothnessTrimAfterLoopComp: React.FC = () => {
	return (
		<Composition
			component={Component}
			id="audio-smoothness-trim-after-loop"
			calculateMetadata={calculateMetadataFn}
		/>
	);
};
