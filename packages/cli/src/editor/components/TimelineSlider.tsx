import {useTimelinePosition, useVideoConfig} from '@remotion/core';
import React, {ChangeEvent, useCallback} from 'react';

export const TimelineSlider: React.FC = () => {
	const [timelinePosition, setTimelinePosition] = useTimelinePosition();
	const videoConfig = useVideoConfig();

	const onChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setTimelinePosition(Number(e.target.value));
		},
		[setTimelinePosition]
	);

	return (
		<input
			type="range"
			value={timelinePosition}
			step={1}
			max={videoConfig.durationInFrames - 1}
			min={0}
			onChange={onChange}
		/>
	);
};
