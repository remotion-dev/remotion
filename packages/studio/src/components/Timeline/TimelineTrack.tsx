import React, {useContext, useMemo} from 'react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {getSequenceAnnotationAttributes} from '../../helpers/sequence-annotation';
import {
	getTimelineLayerHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
} from '../../helpers/timeline-layout';
import {useTimelineSequenceHover} from '../../state/timeline-sequence-hover';
import {ExpandedTracksGetterContext} from '../ExpandedTracksProvider';
import {TimelineExpandedTrackKeyframes} from './TimelineExpandedTrackKeyframes';
import {
	getTimelineSelectedTrackHighlightStyle,
	TIMELINE_SELECTED_BACKGROUND,
	useTimelineRowHighlightBackground,
} from './TimelineSelection';
import {TimelineSequence} from './TimelineSequence';
import {TimelineWidthContext} from './TimelineWidthProvider';
import {useResolvedStack} from './use-resolved-stack';

const emptyConnectedCompositions = [] as const;

const TimelineTrackUnmemoized: React.FC<{
	readonly track: TimelineTrackData;
}> = ({track}) => {
	const annotationLocation = useResolvedStack(track.sequence.getStack());
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
			<div
				style={layerStyle}
				{...getSequenceAnnotationAttributes({
					sequence: track.sequence,
					location: annotationLocation,
					surface: 'track',
				})}
			>
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
					paintEndFrame={null}
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
