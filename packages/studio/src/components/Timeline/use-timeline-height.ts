import {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {
	getExpandedTrackHeight,
	getTimelineLayerHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
} from '../../helpers/timeline-layout';
import {ExpandedTracksGetterContext} from '../ExpandedTracksProvider';
import {MAX_TIMELINE_TRACKS_NOTICE_HEIGHT} from './MaxTimelineTracks';
import {TIMELINE_TIME_INDICATOR_HEIGHT} from './TimelineTimeIndicators';

export const useTimelineHeight = ({
	shown,
	hasBeenCut,
}: {
	shown: TrackWithHash[];
	hasBeenCut: boolean;
}): number => {
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {getCodeValues} = useContext(
		Internals.VisualModeSequenceCodeValuesContext,
	);

	const previewServerConnected = previewServerState.type === 'connected';

	return useMemo(() => {
		const tracksHeight = shown.reduce((acc, track) => {
			const isExpanded =
				previewServerConnected &&
				track.nodePathInfo !== null &&
				getIsExpanded(track.nodePathInfo);
			const layerHeight =
				getTimelineLayerHeight(track.sequence.type) +
				TIMELINE_ITEM_BORDER_BOTTOM;
			const expandedHeight =
				isExpanded && track.nodePathInfo
					? getExpandedTrackHeight({
							sequence: track.sequence,
							nodePathInfo: track.nodePathInfo,
							getIsExpanded,
							getCodeValues,
						}) + TIMELINE_ITEM_BORDER_BOTTOM
					: 0;
			return acc + layerHeight + expandedHeight;
		}, 0);

		return (
			tracksHeight +
			TIMELINE_ITEM_BORDER_BOTTOM +
			(hasBeenCut ? MAX_TIMELINE_TRACKS_NOTICE_HEIGHT : 0) +
			TIMELINE_TIME_INDICATOR_HEIGHT
		);
	}, [shown, hasBeenCut, previewServerConnected, getIsExpanded, getCodeValues]);
};
