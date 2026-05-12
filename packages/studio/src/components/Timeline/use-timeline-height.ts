import {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {
	getExpandedTrackHeight,
	getTimelineLayerHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
} from '../../helpers/timeline-layout';
import {ExpandedTracksContext} from '../ExpandedTracksProvider';
import {MAX_TIMELINE_TRACKS_NOTICE_HEIGHT} from './MaxTimelineTracks';
import {TIMELINE_TIME_INDICATOR_HEIGHT} from './TimelineTimeIndicators';

export const useTimelineHeight = ({
	shown,
	hasBeenCut,
}: {
	shown: TrackWithHash[];
	hasBeenCut: boolean;
}): number => {
	const {expandedTracks} = useContext(ExpandedTracksContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {getDragOverrides, getCodeValues} = useContext(
		Internals.VisualModeGettersContext,
	);
	const {overrideIdToNodePathMappings: subscriptionStates} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);

	const visualModeEnabled =
		Boolean(process.env.EXPERIMENTAL_VISUAL_MODE_ENABLED) &&
		previewServerState.type === 'connected';

	return useMemo(() => {
		const tracksHeight = shown.reduce((acc, track) => {
			const isExpanded =
				visualModeEnabled && (expandedTracks[track.sequence.id] ?? false);
			const layerHeight =
				getTimelineLayerHeight(track.sequence.type) +
				TIMELINE_ITEM_BORDER_BOTTOM;
			const expandedHeight = isExpanded
				? getExpandedTrackHeight({
						sequence: track.sequence,
						expandedTracks,
						getDragOverrides,
						getCodeValues,
						sequencePropsSubscriptionState: subscriptionStates,
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
	}, [
		shown,
		hasBeenCut,
		expandedTracks,
		visualModeEnabled,
		getDragOverrides,
		getCodeValues,
		subscriptionStates,
	]);
};
