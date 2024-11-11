import React, {createRef, useContext, useMemo} from 'react';
import {useVideoConfig} from 'remotion';
import {LIGHT_TRANSPARENT} from '../../helpers/colors';
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

type Props = {
	readonly dragging: boolean;
	readonly type: 'in' | 'out';
	readonly atFrame: number;
};

const InnerTimelineInOutPointerHandle: React.FC<
	Props & {
		readonly timelineWidth: number;
	}
> = ({atFrame, dragging, timelineWidth, type}) => {
	const videoConfig = useVideoConfig();

	const style: React.CSSProperties = useMemo(() => {
		return {
			...line,
			backgroundColor: dragging
				? LIGHT_TRANSPARENT
				: 'rgba(255, 255, 255, 0.1)',
			transform: `translateX(${getXPositionOfItemInTimelineImperatively(
				atFrame,
				videoConfig.durationInFrames,
				timelineWidth,
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

export const TimelineInOutPointerHandle: React.FC<Props> = ({
	dragging,
	type,
	atFrame,
}) => {
	const timelineWidth = useContext(TimelineWidthContext);

	// When switching from a content which has no timeline (still or asset preview)
	// the timeline first needs to mount, so we need to wait for the timeline width
	if (timelineWidth === null) {
		return null;
	}

	return (
		<InnerTimelineInOutPointerHandle
			atFrame={atFrame}
			dragging={dragging}
			timelineWidth={timelineWidth}
			type={type}
		/>
	);
};
