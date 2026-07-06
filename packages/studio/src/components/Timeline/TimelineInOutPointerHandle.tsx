import React, {createRef, useContext, useMemo} from 'react';
import {useVideoConfig} from 'remotion';
import {WHITE_ALPHA_70, WHITE_ALPHA_10} from '../../helpers/colors';
import {getXPositionOfItemInTimelineImperatively} from '../../helpers/get-left-of-timeline-slider';
import {TIMELINE_SCRUBBER_ATTR} from './TimelineSelection';
import {TimelineWidthContext} from './TimelineWidthProvider';

const line: React.CSSProperties = {
	height: '100%',
	width: 1,
	position: 'absolute',
	backgroundColor: WHITE_ALPHA_10,
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
	readonly onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
};

const InnerTimelineInOutPointerHandle: React.FC<
	Props & {
		readonly timelineWidth: number;
	}
> = ({atFrame, dragging, onPointerDown, timelineWidth, type}) => {
	const videoConfig = useVideoConfig();

	const style: React.CSSProperties = useMemo(() => {
		return {
			...line,
			backgroundColor: dragging ? WHITE_ALPHA_70 : WHITE_ALPHA_10,
			transform: `translateX(${getXPositionOfItemInTimelineImperatively(
				atFrame,
				videoConfig.durationInFrames,
				timelineWidth,
			)}px)`,
			top: 0,
		};
	}, [atFrame, dragging, timelineWidth, videoConfig.durationInFrames]);

	return (
		<div
			ref={type === 'in' ? inPointerHandle : outPointerHandle}
			style={style}
			onPointerDown={onPointerDown}
			{...{[TIMELINE_SCRUBBER_ATTR]: true}}
		/>
	);
};

export const TimelineInOutPointerHandle: React.FC<Props> = ({
	dragging,
	onPointerDown,
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
			onPointerDown={onPointerDown}
			timelineWidth={timelineWidth}
			type={type}
		/>
	);
};
