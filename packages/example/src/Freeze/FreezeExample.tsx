import React, {useRef} from 'react';
import {Freeze, Series, staticFile, Video} from 'remotion';

export const FreezeExample: React.FC = () => {
	const video = staticFile('framermp4withoutfileextension');
	const ref = useRef<HTMLDivElement>(null);

	return (
		<Series>
			<Series.Sequence durationInFrames={25}>
				<Freeze frame={0}>
					<Video src={video} />
				</Freeze>
			</Series.Sequence>
			<Series.Sequence ref={ref} durationInFrames={50}>
				<Video src={video} />
			</Series.Sequence>
			<Series.Sequence durationInFrames={50}>
				<Freeze active={(f) => f >= 30} frame={30}>
					<Video src={video} />
				</Freeze>
			</Series.Sequence>
		</Series>
	);
};
