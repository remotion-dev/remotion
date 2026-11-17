import React from 'react';
import {AbsoluteFill, Html5Video, Series, staticFile} from 'remotion';

export const PremountedRemoteVideos: React.FC = () => {
	return (
		<AbsoluteFill>
			<Series>
				<Series.Sequence durationInFrames={200}>
					<Html5Video pauseWhenBuffering src={staticFile('framer.webm')} />
				</Series.Sequence>
				<Series.Sequence durationInFrames={700}>
					<Html5Video
						pauseWhenBuffering
						startFrom={1000}
						src="https://remotion.media/BigBuckBunny.mp4"
					/>
				</Series.Sequence>
			</Series>
		</AbsoluteFill>
	);
};
