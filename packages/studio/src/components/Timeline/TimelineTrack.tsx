import React, {useContext, useMemo} from 'react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_ITEM_BORDER_BOTTOM} from '../../helpers/timeline-layout';
import {useTimelineSequenceHover} from '../../state/timeline-sequence-hover';
import {ExpandedTracksGetterContext} from '../ExpandedTracksProvider';
import {getTimelineSequenceHeight} from './timeline-track-groups';
import {TimelineExpandedTrackKeyframes} from './TimelineExpandedTrackKeyframes';
import {
	getTimelineSelectedTrackHighlightStyle,
	TIMELINE_SELECTED_BACKGROUND,
	useTimelineRowHighlightBackground,
} from './TimelineSelection';
import {TimelineSequence} from './TimelineSequence';
import {TimelineWidthContext} from './TimelineWidthProvider';

const emptyConnectedCompositions = [] as const;

const TimelineTrackUnmemoized: React.FC<{
	readonly track: TimelineTrackData;
}> = ({track}) => {
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const previewServerConnected = previewServerState.type === 'connected';
	const timelineWidth = useContext(TimelineWidthContext);
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

	const showExpandedKeyframes =
		track.nodePathInfo !== null &&
		previewServerConnected &&
		getIsExpanded(track.nodePathInfo);

	return (
		<div onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>
			<div style={layerStyle}>
				{rowHighlightBackground && timelineWidth !== null ? (
					<div
						style={getTimelineSelectedTrackHighlightStyle(
							timelineWidth,
							rowHighlightBackground,
						)}
					/>
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
			{showExpandedKeyframes && track.nodePathInfo ? (
				<TimelineExpandedTrackKeyframes
					sequence={track.sequence}
					nodePathInfo={track.nodePathInfo}
					keyframeDisplayOffset={track.keyframeDisplayOffset}
					keyframePlaybackRate={track.keyframePlaybackRate}
				/>
			) : null}
		</div>
	);
};

export const TimelineTrack = React.memo(TimelineTrackUnmemoized);
