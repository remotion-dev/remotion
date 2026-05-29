import React from 'react';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_ITEM_BORDER_BOTTOM} from '../../helpers/timeline-layout';
import type {getTimelineKeyframes} from './get-timeline-keyframes';
import {TimelineKeyframeDiamond} from './TimelineKeyframeDiamond';
import {
	TIMELINE_SELECTED_TRACK_HIGHLIGHT_STYLE,
	useTimelineRowSelection,
} from './TimelineSelection';

const row: React.CSSProperties = {
	position: 'relative',
};

const rowSeparator: React.CSSProperties = {
	height: TIMELINE_ITEM_BORDER_BOTTOM,
};

const TimelineExpandedKeyframeRowUnmemoized: React.FC<{
	readonly height: number;
	readonly keyframes: ReturnType<typeof getTimelineKeyframes>;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly showSeparator: boolean;
}> = ({height, keyframes, nodePathInfo, showSeparator}) => {
	const {selected: rowSelected} = useTimelineRowSelection(nodePathInfo);

	return (
		<>
			{showSeparator ? <div style={rowSeparator} /> : null}
			<div style={{...row, height}}>
				{rowSelected ? (
					<div style={TIMELINE_SELECTED_TRACK_HIGHLIGHT_STYLE} />
				) : null}
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
