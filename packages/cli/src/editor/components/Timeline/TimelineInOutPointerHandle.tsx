import React, {createRef, useContext, useMemo} from 'react';
import {useVideoConfig} from 'remotion';
import {getXPositionOfItemInTimelineImperatively} from '../../helpers/get-left-of-timeline-slider';
import {TimelineWidthContext} from './TimelineWidthProvider';

const line: React.CSSProperties = {
	height: '100%',
	width: 1,
	position: 'absolute',
	backgroundColor: 'rgba(255, 255, 255, 0.1)',
	cursor: 'ew-resize',
	paddingLeft: 1,
	paddingRight: 1,
};

export const inPointerHandle = createRef<HTMLDivElement>();
export const outPointerHandle = createRef<HTMLDivElement>();

export const TimelineInOutPointerHandle: React.FC<{
	dragging: boolean;
	type: 'in' | 'out';
	atFrame: number;
}> = ({dragging, type, atFrame}) => {
	const timelineWidth = useContext(TimelineWidthContext);
	const videoConfig = useVideoConfig();
	if (timelineWidth === null) {
		throw new Error('Timeline width is null');
	}

	const style: React.CSSProperties = useMemo(() => {
		return {
			...line,
			backgroundColor: dragging
				? 'rgba(255, 255, 255, 0.7)'
				: 'rgba(255, 255, 255, 0.1)',
			transform: `translateX(${getXPositionOfItemInTimelineImperatively(
				atFrame,
				videoConfig.durationInFrames,
				timelineWidth
			)}px)`,
		};
	}, [atFrame, dragging, timelineWidth, videoConfig.durationInFrames]);

	return (
		<div
			ref={type === 'in' ? inPointerHandle : outPointerHandle}
			style={style}
		/>
	);
};
