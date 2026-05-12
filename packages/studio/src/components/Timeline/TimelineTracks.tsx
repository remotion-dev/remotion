import React, {useContext, useMemo} from 'react';
import type {
	GetCodeValues,
	GetDragOverrides,
	OverrideIdToNodePaths,
} from 'remotion';
import {Internals, type TSequence} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {
	getExpandedTrackHeight,
	getTimelineLayerHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {ExpandedTracksContext} from '../ExpandedTracksProvider';
import {isTrackHidden} from './is-collapsed';
import {MaxTimelineTracksReached} from './MaxTimelineTracks';
import {TimelineSequence} from './TimelineSequence';
import {TimelineTimePadding} from './TimelineTimeIndicators';

const content: React.CSSProperties = {
	paddingLeft: TIMELINE_PADDING,
	paddingRight: TIMELINE_PADDING,
	paddingTop: 1,
};

const timelineContent: React.CSSProperties = {
	minHeight: '100%',
};

const getExpandedPlaceholderStyle = ({
	sequence,
	expandedTracks,
	getDragOverrides,
	getCodeValues,
	sequencePropsSubscriptionState,
}: {
	sequence: TSequence;
	expandedTracks: Record<string, boolean>;
	getDragOverrides: GetDragOverrides;
	getCodeValues: GetCodeValues;
	sequencePropsSubscriptionState: OverrideIdToNodePaths;
}): React.CSSProperties => ({
	height:
		getExpandedTrackHeight({
			sequence,
			expandedTracks,
			getDragOverrides,
			getCodeValues,
			sequencePropsSubscriptionState,
		}) + TIMELINE_ITEM_BORDER_BOTTOM,
});

export const TimelineTracks: React.FC<{
	readonly timeline: TrackWithHash[];
	readonly hasBeenCut: boolean;
}> = ({timeline, hasBeenCut}) => {
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

	const timelineStyle: React.CSSProperties = useMemo(() => {
		return {
			...timelineContent,
			width: 100 + '%',
		};
	}, []);

	return (
		<div style={timelineStyle}>
			<div style={content}>
				<TimelineTimePadding />
				{timeline.map((track) => {
					if (isTrackHidden(track)) {
						return null;
					}

					const isExpanded = expandedTracks[track.sequence.id] ?? false;

					return (
						<div key={track.sequence.id}>
							<div
								style={{
									height: getTimelineLayerHeight(track.sequence.type),
									marginBottom: TIMELINE_ITEM_BORDER_BOTTOM,
								}}
							>
								<TimelineSequence s={track.sequence} />
							</div>
							{visualModeEnabled && isExpanded ? (
								<div
									style={getExpandedPlaceholderStyle({
										sequence: track.sequence,
										expandedTracks,
										getDragOverrides,
										getCodeValues,
										sequencePropsSubscriptionState: subscriptionStates,
									})}
								/>
							) : null}
						</div>
					);
				})}
			</div>
			{hasBeenCut ? <MaxTimelineTracksReached /> : null}
		</div>
	);
};
