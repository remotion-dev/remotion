import {Video} from '@remotion/media';
import React from 'react';
import {Sequence, staticFile, useVideoConfig} from 'remotion';

const SLICE_DURATION_FRAMES = 3; // 0.1sec at 30fps
const NUM_SLICES = 100;
const PREMOUNT_SEC = 0.5;

export const SlicedVideo: React.FC = () => {
	const src = staticFile('sliced-video.mp4');
	const {fps} = useVideoConfig();

	return (
		<Sequence from={45} premountFor={45}>
			{new Array(NUM_SLICES).fill(0).map((_, i) => {
				const from = i * SLICE_DURATION_FRAMES;
				return (
					<Sequence
						key={i}
						from={from}
						durationInFrames={SLICE_DURATION_FRAMES}
						premountFor={PREMOUNT_SEC * fps}
					>
						<Video src={src} trimBefore={from} debugAudioScheduling />
					</Sequence>
				);
			})}
		</Sequence>
	);
};
