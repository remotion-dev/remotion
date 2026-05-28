import React, {useContext, useMemo} from 'react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {
	getTimelineLayerHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
} from '../../helpers/timeline-layout';
import {ExpandedTracksGetterContext} from '../ExpandedTracksProvider';
import {TimelineExpandedTrackKeyframes} from './TimelineExpandedTrackKeyframes';
import {
	TIMELINE_SELECTED_TRACK_HIGHLIGHT_STYLE,
	useTimelineRowContainsSelection,
	useTimelineRowSelection,
} from './TimelineSelection';
import {TimelineSequence} from './TimelineSequence';

const TimelineTrackUnmemoized: React.FC<{
	readonly track: TrackWithHash;
}> = ({track}) => {
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const previewServerConnected = previewServerState.type === 'connected';
	const {selected: rowSelected} = useTimelineRowSelection(track.nodePathInfo);
	const containsSelection = useTimelineRowContainsSelection(track.nodePathInfo);

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

	const showRowHighlight =
		track.nodePathInfo !== null && (rowSelected || containsSelection);

	return (
		<div>
			<div style={layerStyle}>
				{showRowHighlight ? (
					<div style={TIMELINE_SELECTED_TRACK_HIGHLIGHT_STYLE} />
				) : null}
				<TimelineSequence
					s={track.sequence}
					nodePathInfo={track.nodePathInfo}
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
