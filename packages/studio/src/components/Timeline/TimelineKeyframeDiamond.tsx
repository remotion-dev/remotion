import React, {useCallback, useContext, useMemo} from 'react';
import {useVideoConfig} from 'remotion';
import {BLUE, LIGHT_TEXT} from '../../helpers/colors';
import {getXPositionOfItemInTimelineImperatively} from '../../helpers/get-left-of-timeline-slider';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {useTimelineKeyframeSelection} from './TimelineSelection';
import {TimelineWidthContext} from './TimelineWidthProvider';
import {useTimelineKeyframeDrag} from './use-timeline-keyframe-drag';

const diamondBase: React.CSSProperties = {
	position: 'absolute',
	width: 8,
	height: 8,
	backgroundColor: LIGHT_TEXT,
	borderRadius: 1,
	boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.4)',
};

const TimelineKeyframeDiamondUnmemoized: React.FC<{
	readonly frame: number;
	readonly rowHeight: number;
	readonly nodePathInfo: SequenceNodePathInfo;
}> = ({frame, rowHeight, nodePathInfo}) => {
	const videoConfig = useVideoConfig();
	const timelineWidth = useContext(TimelineWidthContext);
	const {selected, onSelect, selectable} = useTimelineKeyframeSelection(
		nodePathInfo,
		frame,
	);
	const {dragging, onPointerDown: onDragPointerDown} = useTimelineKeyframeDrag({
		nodePathInfo,
		frame,
		timelineWidth,
		timelineDurationInFrames: videoConfig.durationInFrames,
	});

	const style = useMemo((): React.CSSProperties | null => {
		if (timelineWidth === null) {
			return null;
		}

		return {
			...diamondBase,
			backgroundColor: LIGHT_TEXT,
			outline: selected ? '2px solid ' + BLUE : 'none',
			border: 'none',
			cursor: dragging ? 'grabbing' : 'ew-resize',
			left:
				getXPositionOfItemInTimelineImperatively(
					frame,
					videoConfig.durationInFrames,
					timelineWidth,
				) - TIMELINE_PADDING,
			padding: 0,
			pointerEvents: 'auto',
			touchAction: 'none',
			top: rowHeight / 2,
			transform: 'translate(-50%, -50%) rotate(45deg)',
			zIndex: 2,
		};
	}, [
		dragging,
		frame,
		rowHeight,
		selected,
		timelineWidth,
		videoConfig.durationInFrames,
	]);

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLButtonElement>) => {
			if (e.button === 0) {
				e.stopPropagation();
				onSelect({
					shiftKey: e.shiftKey,
					toggleKey: e.metaKey || e.ctrlKey,
				});
				onDragPointerDown(e);
			}
		},
		[onDragPointerDown, onSelect],
	);

	if (style === null) {
		return null;
	}

	return (
		<button
			type="button"
			style={style}
			title={`Drag keyframe at frame ${frame}`}
			aria-label={`Drag keyframe at frame ${frame}`}
			onPointerDown={selectable ? onPointerDown : undefined}
		/>
	);
};

export const TimelineKeyframeDiamond = React.memo(
	TimelineKeyframeDiamondUnmemoized,
);
