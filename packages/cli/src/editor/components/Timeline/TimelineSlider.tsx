import React from 'react';
import {Internals} from 'remotion';
import styled from 'styled-components';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {useWindowSize} from '../../hooks/use-window-size';
import {TimelineSliderHandle} from './TimelineSliderHandle';

const Container = styled.div`
	position: absolute;
	bottom: 0;
	top: 0;
`;

const Line = styled.div`
	height: 100%;
	width: 1px;
	position: fixed;
	background-color: #f02c00;
`;

export const TimelineSlider: React.FC = () => {
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const videoConfig = Internals.useUnsafeVideoConfig();
	const {width} = useWindowSize();

	if (!videoConfig) {
		return null;
	}

	const left =
		(timelinePosition / (videoConfig.durationInFrames - 1)) *
		(width - TIMELINE_PADDING * 2 - 1);

	return (
		<Container style={{transform: `translateX(${left}px)`}}>
			<Line>
				<TimelineSliderHandle />
			</Line>
		</Container>
	);
};
