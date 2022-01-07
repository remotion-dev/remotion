import React, {useMemo} from 'react';
import {Internals} from 'remotion';
import {useGetXPositionOfItemInTimeline} from '../../helpers/get-left-of-timeline-slider';
import {TimelineSliderHandle} from './TimelineSliderHandle';

const container: React.CSSProperties = {
	position: 'absolute',
	bottom: 0,
	top: 0,
	pointerEvents: 'none',
};

const line: React.CSSProperties = {
	height: '100%',
	width: 1,
	position: 'fixed',
	backgroundColor: '#f02c00',
};

export const TimelineSlider: React.FC = () => {
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const {get} = useGetXPositionOfItemInTimeline();

	const style: React.CSSProperties = useMemo(() => {
		const left = get(timelinePosition);
		return {
			...container,
			transform: `translateX(${left}px)`,
		};
	}, [timelinePosition, get]);

	return (
		<div style={style}>
			<div style={line}>
				<TimelineSliderHandle />
			</div>
		</div>
	);
};
