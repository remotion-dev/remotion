import {Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Series, useVideoConfig} from 'remotion';

const src = 'https://remotion.media/video.mp4';

const segments = [
	{
		duration: 60,
		speed: 0.5,
	},
	{
		duration: 60,
		speed: 1,
	},
	{
		duration: 120,
		speed: 2,
	},
	{
		duration: 60,
		speed: 4,
	},
];

type AccumulatedSegment = {
	start: number;
	passedVideoTime: number;
	end: number;
	speed: number;
};

const accumulateSegments = () => {
	const accumulatedSegments: AccumulatedSegment[] = [];
	let accumulatedDuration = 0;
	let accumulatedPassedVideoTime = 0;

	for (const segment of segments) {
		const duration = segment.duration / segment.speed;
		accumulatedSegments.push({
			end: accumulatedDuration + duration,
			speed: segment.speed,
			start: accumulatedDuration,
			passedVideoTime: accumulatedPassedVideoTime,
		});
		accumulatedPassedVideoTime += segment.duration;
		accumulatedDuration += duration;
	}

	return accumulatedSegments;
};

const accumulatedSegments = accumulateSegments();

export const DIFFERENT_SEGMENTS_AT_DIFFERENT_SPEEDS_DURATION = Math.ceil(
	accumulatedSegments[accumulatedSegments.length - 1].end,
);

export const DifferentSegmentsAtDifferentSpeeds: React.FC = () => {
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Series>
				{accumulatedSegments.map((segment) => (
					<Series.Sequence
						key={segment.start}
						durationInFrames={segment.end - segment.start}
						premountFor={Math.round(1.5 * fps)}
					>
						<Video
							src={src}
							trimBefore={segment.passedVideoTime}
							playbackRate={segment.speed}
							debugOverlay
							style={{
								height: '100%',
								width: '100%',
							}}
						/>
					</Series.Sequence>
				))}
			</Series>
		</AbsoluteFill>
	);
};
