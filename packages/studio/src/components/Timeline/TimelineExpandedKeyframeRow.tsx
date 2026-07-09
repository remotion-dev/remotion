import React, {useContext} from 'react';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_ITEM_BORDER_BOTTOM} from '../../helpers/timeline-layout';
import {getTimelineEasingSegments} from './get-timeline-easing-segments';
import type {getTimelineKeyframes} from './get-timeline-keyframes';
import {TimelineKeyframeDiamond} from './TimelineKeyframeDiamond';
import {TimelineKeyframeEasingLine} from './TimelineKeyframeEasingLine';
import {
	getTimelineSelectedTrackHighlightStyle,
	useTimelineRowHighlightBackground,
} from './TimelineSelection';
import {TimelineWidthContext} from './TimelineWidthProvider';

const row: React.CSSProperties = {
	position: 'relative',
};

const rowSeparator: React.CSSProperties = {
	height: TIMELINE_ITEM_BORDER_BOTTOM,
};

const TimelineExpandedKeyframeRowUnmemoized: React.FC<{
	readonly height: number;
	readonly keyframes: ReturnType<typeof getTimelineKeyframes>;
	readonly canEditEasing: boolean;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly showSeparator: boolean;
}> = ({height, keyframes, canEditEasing, nodePathInfo, showSeparator}) => {
	const timelineWidth = useContext(TimelineWidthContext);
	const rowHighlightBackground =
		useTimelineRowHighlightBackground(nodePathInfo);
	const easingSegments = canEditEasing
		? getTimelineEasingSegments(keyframes)
		: [];

	return (
		<>
			{showSeparator ? <div style={rowSeparator} /> : null}
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
						frame={keyframe.frame}
						rowHeight={height}
						nodePathInfo={nodePathInfo}
					/>
				))}
			</div>
		</>
	);
};

export const TimelineExpandedKeyframeRow = React.memo(
	TimelineExpandedKeyframeRowUnmemoized,
);
