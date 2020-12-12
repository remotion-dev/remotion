import {
	usePlayingState,
	useTimelinePosition,
	useVideoConfig,
} from '@remotion/core';
import React, {ChangeEvent, useCallback} from 'react';

export const TimelineSlider: React.FC = () => {
	const [timelinePosition, setTimelinePosition] = useTimelinePosition();
	const [playing, setPlaying] = usePlayingState();
	const videoConfig = useVideoConfig();

	const onChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setTimelinePosition(Number(e.target.value));
		},
		[setTimelinePosition]
	);

	const onDragStart = useCallback(() => {
		if (playing) {
			setPlaying(false);
		}
	}, [setPlaying, playing]);

	if (!videoConfig) {
		return null;
	}

	return (
		<input
			type="range"
			value={timelinePosition}
			step={1}
			onDragStart={onDragStart}
			max={videoConfig.durationInFrames - 1}
			min={0}
			onChange={onChange}
		/>
	);
};
