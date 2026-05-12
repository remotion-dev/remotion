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
	const {getDragOverrides, getCodeValues} = useContext(
		Internals.VisualModeGettersContext,
	);

	const visualModeEnabled =
		Boolean(process.env.EXPERIMENTAL_VISUAL_MODE_ENABLED) &&
		previewServerState.type === 'connected';

	return useMemo(() => {
		const tracksHeight = shown.reduce((acc, track) => {
			const isExpanded =
				visualModeEnabled &&
				track.nodePath !== null &&
				getIsExpanded(track.nodePath);
			const layerHeight =
				getTimelineLayerHeight(track.sequence.type) +
				TIMELINE_ITEM_BORDER_BOTTOM;
			const expandedHeight =
				isExpanded && track.nodePath
					? getExpandedTrackHeight({
							sequence: track.sequence,
							nodePath: track.nodePath,
							getIsExpanded,
							getDragOverrides,
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
	}, [
		shown,
		hasBeenCut,
		visualModeEnabled,
		getIsExpanded,
		getDragOverrides,
		getCodeValues,
	]);
};
