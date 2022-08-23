import React from 'react';
import {Freeze, Series, staticFile, Video} from 'remotion';

export const FreezeExample: React.FC = () => {
	const video = staticFile('framermp4withoutfileextension');

	return (
		<Series>
			<Series.Sequence durationInFrames={25}>
				<Freeze frame={0}>
					<Video src={video} />
				</Freeze>
			</Series.Sequence>
			<Series.Sequence durationInFrames={50}>
				<Video src={video} />
			</Series.Sequence>
			<Series.Sequence durationInFrames={50}>
				<Freeze frame={126}>
					<Video src={video} />
				</Freeze>
			</Series.Sequence>
		</Series>
	);
};
