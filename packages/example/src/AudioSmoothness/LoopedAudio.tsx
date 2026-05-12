import {Audio} from '@remotion/media';
import React from 'react';
import {Composition} from 'remotion';

const src = 'https://remotion.media/dialogue.wav';

const Component: React.FC = () => {
	return <Audio src={src} trimAfter={2 * 30} loop />;
};

export const AudioSmoothnessLoopedAudioComp: React.FC = () => {
	return (
		<Composition
			component={Component}
			id="audio-smoothness-looped-audio"
			fps={30}
			width={1920}
			height={1080}
			durationInFrames={600}
		/>
	);
};
