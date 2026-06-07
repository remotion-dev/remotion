import React, {useCallback, useContext, useMemo} from 'react';
import {useVideoConfig} from 'remotion';
import {BLUE, LINE_COLOR} from '../../helpers/colors';
import {getXPositionOfItemInTimelineImperatively} from '../../helpers/get-left-of-timeline-slider';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {useTimelineEasingSelection} from './TimelineSelection';
import {TimelineWidthContext} from './TimelineWidthProvider';

const hitTargetHeight = 12;
const lineHeight = 2;

const easingLineButton: React.CSSProperties = {
	background: 'none',
	border: 'none',
	height: hitTargetHeight,
	padding: 0,
	position: 'absolute',
	transform: 'translateY(-50%)',
};

const easingLine: React.CSSProperties = {
	backgroundColor: LINE_COLOR,
	borderRadius: lineHeight / 2,
	height: lineHeight,
	left: 0,
	position: 'absolute',
	right: 0,
	top: '50%',
	transform: 'translateY(-50%)',
};

const TimelineKeyframeEasingLineUnmemoized: React.FC<{
	readonly fromFrame: number;
	readonly toFrame: number;
	readonly rowHeight: number;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly segmentIndex: number;
}> = ({fromFrame, toFrame, rowHeight, nodePathInfo, segmentIndex}) => {
	const videoConfig = useVideoConfig();
	const timelineWidth = useContext(TimelineWidthContext);
	const {selected, onSelect, selectable} = useTimelineEasingSelection({
		nodePathInfo,
		fromFrame,
		toFrame,
		segmentIndex,
	});

	const style = useMemo((): React.CSSProperties | null => {
		if (timelineWidth === null) {
			return null;
		}

		const fromLeft =
			getXPositionOfItemInTimelineImperatively(
				fromFrame,
				videoConfig.durationInFrames,
				timelineWidth,
			) - TIMELINE_PADDING;
		const toLeft =
			getXPositionOfItemInTimelineImperatively(
				toFrame,
				videoConfig.durationInFrames,
				timelineWidth,
			) - TIMELINE_PADDING;
		const left = Math.min(fromLeft, toLeft);
		const width = Math.abs(toLeft - fromLeft);
		if (width === 0) {
			return null;
		}

		return {
			...easingLineButton,
			left,
			pointerEvents: selectable ? 'auto' : 'none',
			top: rowHeight / 2,
			width,
		};
	}, [
		fromFrame,
		rowHeight,
		selectable,
		timelineWidth,
		toFrame,
		videoConfig.durationInFrames,
	]);

	const lineStyle = useMemo(
		(): React.CSSProperties => ({
			...easingLine,
			outline: selected ? `1px solid ${BLUE}` : undefined,
		}),
		[selected],
	);

	const onPointerDown = useCallback(
		(event: React.PointerEvent<HTMLButtonElement>) => {
			if (!selectable || event.button !== 0) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			onSelect({
				shiftKey: event.shiftKey,
				toggleKey: event.metaKey || event.ctrlKey,
			});
		},
		[onSelect, selectable],
	);

	if (style === null) {
		return null;
	}

	return (
		<button
			type="button"
			style={style}
			title={`Easing from frame ${fromFrame} to ${toFrame}`}
			aria-label={`Select easing from frame ${fromFrame} to ${toFrame}`}
			onPointerDown={selectable ? onPointerDown : undefined}
		>
			<div style={lineStyle} />
		</button>
	);
};

export const TimelineKeyframeEasingLine = React.memo(
	TimelineKeyframeEasingLineUnmemoized,
);
