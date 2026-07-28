import React, {useContext, useMemo} from 'react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {
	getTimelineLayerHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
} from '../../helpers/timeline-layout';
import {useTimelineSequenceHover} from '../../state/timeline-sequence-hover';
import {ExpandedTracksGetterContext} from '../ExpandedTracksProvider';
import {TimelineExpandedTrackKeyframes} from './TimelineExpandedTrackKeyframes';
import {
	getTimelineSelectedTrackHighlightStyle,
	useTimelineRowHighlightBackground,
} from './TimelineSelection';
import {TimelineSequence} from './TimelineSequence';
import {TimelineWidthContext} from './TimelineWidthProvider';

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
		hovered,
	);

	const layerStyle = useMemo(
		(): React.CSSProperties => ({
			height: getTimelineLayerHeight(track.sequence.type),
			marginBottom: TIMELINE_ITEM_BORDER_BOTTOM,
			position: 'relative',
		}),
		[track.sequence.type],
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
					connectedCompositions={track.connectedCompositions ?? []}
					nodePathInfo={track.nodePathInfo}
					sequenceFrameOffset={track.sequenceFrameOffset}
				/>
			</div>
			{showExpandedKeyframes && track.nodePathInfo ? (
				<TimelineExpandedTrackKeyframes
					sequence={track.sequence}
					nodePathInfo={track.nodePathInfo}
					keyframeDisplayOffset={track.keyframeDisplayOffset}
				/>
			) : null}
		</div>
	);
};

export const TimelineTrack = React.memo(TimelineTrackUnmemoized);
