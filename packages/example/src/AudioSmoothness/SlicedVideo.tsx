import {Audio} from '@remotion/media';
import React from 'react';
import {Composition, Sequence, useVideoConfig} from 'remotion';

const SLICE_DURATION_FRAMES = 6; // 0.1sec at 30fps
const NUM_SLICES = 100;
const PREMOUNT_SEC = 1;

const SlicedVideo: React.FC = () => {
	const src = 'https://remotion.media/video.mp4';
	const {fps} = useVideoConfig();

	return (
		<Sequence premountFor={45}>
			{new Array(NUM_SLICES).fill(0).map((_, i) => {
				const from = i * SLICE_DURATION_FRAMES;
				return (
					<Sequence
						key={i}
						from={from}
						durationInFrames={SLICE_DURATION_FRAMES}
						premountFor={PREMOUNT_SEC * fps}
					>
						<Audio src={src} trimBefore={from} />
					</Sequence>
				);
			})}
		</Sequence>
	);
};

export const AudioSmoothnessSlicedVideoComp: React.FC = () => {
	return (
		<Composition
			id="audio-smoothness-sliced-video"
			component={SlicedVideo}
			fps={30}
			height={1080}
			durationInFrames={300}
			width={1920}
		/>
	);
};
