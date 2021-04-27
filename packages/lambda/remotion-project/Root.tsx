import React from 'react';
import {Composition} from 'remotion';
import {MyVideo} from './MyVideo';

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			fps={30}
			durationInFrames={1000}
			component={MyVideo}
			height={1080}
			width={1920}
			id="my-video"
		/>
	);
};
