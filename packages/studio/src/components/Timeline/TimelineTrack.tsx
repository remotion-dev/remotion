import React, {useContext, useMemo} from 'react';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_ITEM_BORDER_BOTTOM} from '../../helpers/timeline-layout';
import {useTimelineSequenceHover} from '../../state/timeline-sequence-hover';
import {getTimelineSequenceHeight} from './timeline-track-groups';
import {
	getTimelineSelectedTrackHighlightStyle,
	TIMELINE_SELECTED_BACKGROUND,
	useTimelineRowHighlightBackground,
} from './TimelineSelection';
import {TimelineSequence} from './TimelineSequence';
import {TimelineWidthContext} from './TimelineWidthProvider';

const emptyConnectedCompositions = [] as const;

const TimelineTrackHighlight: React.FC<{readonly background: string}> = ({
	background,
}) => {
	const timelineWidth = useContext(TimelineWidthContext);
	return timelineWidth === null ? null : (
		<div
			style={getTimelineSelectedTrackHighlightStyle(timelineWidth, background)}
		/>
	);
};

const TimelineTrackUnmemoized: React.FC<{
	readonly track: TimelineTrackData;
}> = ({track}) => {
	const {hovered, onPointerEnter, onPointerLeave} = useTimelineSequenceHover(
		track.nodePathInfo,
	);
	const rowHighlightBackground = useTimelineRowHighlightBackground(
		track.nodePathInfo,
		{
			hovered,
			selectedBackground: TIMELINE_SELECTED_BACKGROUND,
		},
	);

	const layerStyle = useMemo(
		(): React.CSSProperties => ({
			height: getTimelineSequenceHeight(track.sequence),
			marginBottom: TIMELINE_ITEM_BORDER_BOTTOM,
			position: 'relative',
		}),
		[track.sequence],
	);

	return (
		<div onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>
			<div style={layerStyle}>
				{rowHighlightBackground ? (
					<TimelineTrackHighlight background={rowHighlightBackground} />
				) : null}
				<TimelineSequence
					s={track.sequence}
					labelStartFrame={null}
					cascadedStart={track.cascadedStart}
					localStart={track.localStart}
					parentVisibleStart={track.parentVisibleStart}
					parentVisibleEnd={track.parentVisibleEnd}
					connectedCompositions={
						track.connectedCompositions ?? emptyConnectedCompositions
					}
					nodePathInfo={track.nodePathInfo}
					keyframeDisplayOffset={track.keyframeDisplayOffset}
					keyframePlaybackRate={track.keyframePlaybackRate}
					sequenceFrameOffset={track.sequenceFrameOffset}
				/>
			</div>
		</div>
	);
};

export const TimelineTrack = React.memo(TimelineTrackUnmemoized);
