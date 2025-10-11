import React from 'react';
import {AbsoluteFill, Html5Video, Series} from 'remotion';

const Inside: React.FC = () => {
	return (
		<Html5Video
			pauseWhenBuffering
			src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
		/>
	);
};

export const NativeBufferStateForVideo: React.FC = () => {
	return (
		<Series>
			<Series.Sequence durationInFrames={100}>
				<AbsoluteFill style={{backgroundColor: 'red'}} />
			</Series.Sequence>
			<Series.Sequence durationInFrames={100}>
				<Inside />
			</Series.Sequence>
		</Series>
	);
};
