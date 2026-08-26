import React, {useContext} from 'react';
import {areSequenceNodePathInfosEqual} from '../../helpers/are-sequence-node-path-infos-equal';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {getTimelineEasingSegments} from './get-timeline-easing-segments';
import type {getTimelineKeyframes} from './get-timeline-keyframes';
import {TimelineKeyframeDiamond} from './TimelineKeyframeDiamond';
import {TimelineKeyframeEasingLine} from './TimelineKeyframeEasingLine';
import {
	getTimelineSelectedTrackHighlightStyle,
	TIMELINE_EXPANDED_SELECTED_BACKGROUND,
	useTimelineRowHighlightBackground,
} from './TimelineSelection';
import {TimelineWidthContext} from './TimelineWidthProvider';

const rowClipper: React.CSSProperties = {
	boxSizing: 'border-box',
	marginLeft: -TIMELINE_PADDING,
	marginRight: -TIMELINE_PADDING,
	overflow: 'hidden',
	paddingLeft: TIMELINE_PADDING,
	paddingRight: TIMELINE_PADDING,
};

const row: React.CSSProperties = {
	position: 'relative',
};

const rowSeparator: React.CSSProperties = {
	height: TIMELINE_ITEM_BORDER_BOTTOM,
};

type TimelineExpandedKeyframeRowProps = {
	readonly height: number;
	readonly keyframes: ReturnType<typeof getTimelineKeyframes>;
	readonly canEditEasing: boolean;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly showSeparator: boolean;
};

const TimelineExpandedKeyframeRowUnmemoized: React.FC<
	TimelineExpandedKeyframeRowProps
> = ({height, keyframes, canEditEasing, nodePathInfo, showSeparator}) => {
	const timelineWidth = useContext(TimelineWidthContext);
	const rowHighlightBackground = useTimelineRowHighlightBackground(
		nodePathInfo,
		{
			hovered: false,
			selectedBackground: TIMELINE_EXPANDED_SELECTED_BACKGROUND,
		},
	);
	const easingSegments = canEditEasing
		? getTimelineEasingSegments(keyframes)
		: [];

	return (
		<>
			{showSeparator ? <div style={rowSeparator} /> : null}
			<div style={{...rowClipper, height, width: timelineWidth ?? undefined}}>
				<div style={{...row, height}}>
					{rowHighlightBackground && timelineWidth !== null ? (
						<div
							style={getTimelineSelectedTrackHighlightStyle(
								timelineWidth,
								rowHighlightBackground,
							)}
						/>
					) : null}
					{easingSegments.map((segment) => (
						<TimelineKeyframeEasingLine
							key={`${segment.segmentIndex}-${segment.fromFrame}-${segment.toFrame}`}
							fromFrame={segment.fromFrame}
							toFrame={segment.toFrame}
							rowHeight={height}
							nodePathInfo={nodePathInfo}
							segmentIndex={segment.segmentIndex}
						/>
					))}
					{keyframes.map((keyframe) => (
						<TimelineKeyframeDiamond
							key={keyframe.frame}
							disabled={keyframe.disabled === true}
							frame={keyframe.frame}
							rowHeight={height}
							nodePathInfo={nodePathInfo}
						/>
					))}
				</div>
			</div>
		</>
	);
};

const areTimelineExpandedKeyframeRowPropsEqual = (
	prevProps: TimelineExpandedKeyframeRowProps,
	nextProps: TimelineExpandedKeyframeRowProps,
) => {
	if (
		prevProps.height !== nextProps.height ||
		prevProps.canEditEasing !== nextProps.canEditEasing ||
		prevProps.showSeparator !== nextProps.showSeparator ||
		prevProps.keyframes.length !== nextProps.keyframes.length ||
		!areSequenceNodePathInfosEqual(
			prevProps.nodePathInfo,
			nextProps.nodePathInfo,
		)
	) {
		return false;
	}

	return prevProps.keyframes.every(
		(keyframe, index) => keyframe.frame === nextProps.keyframes[index].frame,
	);
};

export const TimelineExpandedKeyframeRow = React.memo(
	TimelineExpandedKeyframeRowUnmemoized,
	areTimelineExpandedKeyframeRowPropsEqual,
);
