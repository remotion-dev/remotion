import React from 'react';
import {AbsoluteFill, Sequence, staticFile, Video} from 'remotion';

const ShouldNotUnmount: React.FC = () => {
	return <Video pauseWhenBuffering src={staticFile('framer.webm')} />;
};

export const PremountedExample: React.FC = () => {
	return (
		<AbsoluteFill>
			<Sequence
				premountFor={10}
				postmountFor={10}
				from={30}
				durationInFrames={80}
			>
				<ShouldNotUnmount />
			</Sequence>
			<Sequence
				premountFor={10}
				postmountFor={10}
				from={30}
				durationInFrames={80}
			>
				<ShouldNotUnmount />
			</Sequence>
		</AbsoluteFill>
	);
};
