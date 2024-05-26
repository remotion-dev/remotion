import React from 'react';
import {AbsoluteFill, Series, staticFile, Video} from 'remotion';

export const PremountedRemoteVideos: React.FC = () => {
	return (
		<AbsoluteFill>
			<Series>
				<Series.Sequence durationInFrames={200} premountFor={20}>
					<Video pauseWhenBuffering src={staticFile('framer.webm')} />
				</Series.Sequence>
				<Series.Sequence durationInFrames={700} premountFor={30}>
					<Video
						pauseWhenBuffering
						startFrom={1000}
						src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
					/>
				</Series.Sequence>
			</Series>
		</AbsoluteFill>
	);
};
