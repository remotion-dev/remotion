import React from 'react';
import {AbsoluteFill, PremountedSequence, staticFile, Video} from 'remotion';

const ShouldNotUnmount: React.FC = () => {
	return <Video src={staticFile('framer.webm')} />;
};

export const PremountedExample: React.FC = () => {
	return (
		<AbsoluteFill>
			<PremountedSequence premountFor={10} from={30} durationInFrames={200}>
				<ShouldNotUnmount />
			</PremountedSequence>
			<PremountedSequence premountFor={10} from={30} durationInFrames={200}>
				<ShouldNotUnmount />
			</PremountedSequence>
		</AbsoluteFill>
	);
};
