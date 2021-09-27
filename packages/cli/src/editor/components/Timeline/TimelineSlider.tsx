import {PlayerInternals} from '@remotion/player';
import React from 'react';
import {Internals} from 'remotion';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {sliderAreaRef} from './timeline-refs';
import {TimelineSliderHandle} from './TimelineSliderHandle';

const container: React.CSSProperties = {
	position: 'absolute',
	bottom: 0,
	top: 0,
};

const line: React.CSSProperties = {
	height: '100%',
	width: 1,
	position: 'fixed',
	backgroundColor: '#f02c00',
};

export const TimelineSlider: React.FC = () => {
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const videoConfig = Internals.useUnsafeVideoConfig();
	const size = PlayerInternals.useElementSize(sliderAreaRef, {
		triggerOnWindowResize: false,
	});
	const width = size?.width ?? 0;

	if (!videoConfig) {
		return null;
	}

	const left =
		(timelinePosition / (videoConfig.durationInFrames - 1)) *
			(width - TIMELINE_PADDING * 2) +
		TIMELINE_PADDING;

	return (
		<div style={{...container, transform: `translateX(${left}px)`}}>
			<div style={line}>
				<TimelineSliderHandle />
			</div>
		</div>
	);
};
