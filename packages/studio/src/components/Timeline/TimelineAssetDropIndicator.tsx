import React, {useContext} from 'react';
import {Internals} from 'remotion';
import {RULER_COLOR} from '../../helpers/colors';
import {getXPositionOfItemInTimelineImperatively} from '../../helpers/get-left-of-timeline-slider';
import {TimelineAssetDropFrameContext} from './timeline-asset-drop-context';
import {sliderAreaRef} from './timeline-refs';
import {TimelineWidthContext} from './TimelineWidthProvider';

const indicator: React.CSSProperties = {
	backgroundColor: RULER_COLOR,
	bottom: 0,
	pointerEvents: 'none',
	position: 'absolute',
	top: 0,
	width: 1,
	zIndex: 10,
};

export const TimelineAssetDropIndicator: React.FC = () => {
	const frame = useContext(TimelineAssetDropFrameContext);
	const timelineWidth = useContext(TimelineWidthContext);
	const videoConfig = Internals.useUnsafeVideoConfig();

	if (frame === null || timelineWidth === null || videoConfig === null) {
		return null;
	}

	const width = sliderAreaRef.current?.clientWidth ?? timelineWidth;
	const left = getXPositionOfItemInTimelineImperatively(
		frame,
		videoConfig.durationInFrames,
		width,
	);

	return (
		<div
			data-timeline-asset-drop-indicator="true"
			style={{
				...indicator,
				transform: `translateX(${left - 0.5}px)`,
			}}
		/>
	);
};
