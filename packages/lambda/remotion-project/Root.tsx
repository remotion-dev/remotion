import React from 'react';
import {Composition, getInputProps} from 'remotion';
import {MyVideo} from './MyVideo';

export const RemotionRoot: React.FC = () => {
	const inputProps = getInputProps();
	return (
		<Composition
			fps={30}
			durationInFrames={inputProps.duration ?? 200}
			component={MyVideo}
			height={1080}
			width={1920}
			id="my-video"
		/>
	);
};
