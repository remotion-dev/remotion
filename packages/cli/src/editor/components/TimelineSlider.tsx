import React, {useMemo} from 'react';
import {Internals} from 'remotion';
import styled from 'styled-components';
import {
	TIMELINE_LEFT_PADDING,
	TIMELINE_RIGHT_PADDING,
} from '../helpers/timeline-layout';
import {useWindowSize} from '../hooks/use-window-size';
import {TimelineSliderHandle} from './TimelineSliderHandle';

const Container = styled.div`
	position: absolute;
	top: 0;
`;

const Line = styled.div`
	height: 400px;
	width: 1px;
	position: fixed;
	background-color: #f02c00;
`;

export const TimelineSlider: React.FC = () => {
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const videoConfig = Internals.useUnsafeVideoConfig();
	const {width} = useWindowSize();

	const left = useMemo(() => {
		if (!videoConfig) {
			return 0;
		}
		return (
			(timelinePosition / videoConfig.durationInFrames) *
				(width - TIMELINE_LEFT_PADDING - TIMELINE_RIGHT_PADDING - 1) +
			TIMELINE_LEFT_PADDING
		);
	}, [timelinePosition, videoConfig, width]);

	if (!videoConfig) {
		return null;
	}

	return (
		<Container
			style={{
				left,
			}}
		>
			<Line>
				<TimelineSliderHandle />
			</Line>
		</Container>
	);
};
