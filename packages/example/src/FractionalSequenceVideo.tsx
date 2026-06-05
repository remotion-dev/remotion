import {Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';

export const FractionalSequenceVideo: React.FC = () => {
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={10.920000000000016}>
				<Video src="https://remotion.media/video.mp4" />
			</Sequence>
			<Sequence from={10.920000000000016}>
				<Video src="https://remotion.media/video.mp4" />
			</Sequence>
		</AbsoluteFill>
	);
};
