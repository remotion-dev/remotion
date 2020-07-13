import React, {useCallback, ChangeEvent} from 'react';
import {useTimelinePosition, useVideoConfig} from '@jonny/motion-core';

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
			max={videoConfig.frames - 1}
			min={0}
			onChange={onChange}
		/>
	);
};
