import React, {useContext, useMemo} from 'react';
import type {GetCodeValues, GetDragOverrides, SequenceNodePath} from 'remotion';
import {Internals, type TSequence} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {
	getExpandedTrackHeight,
	getTimelineLayerHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {
	ExpandedTracksGetterContext,
	type GetIsExpanded,
} from '../ExpandedTracksProvider';
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
	nodePath,
	getIsExpanded,
	getDragOverrides,
	getCodeValues,
}: {
	sequence: TSequence;
	nodePath: SequenceNodePath;
	getIsExpanded: GetIsExpanded;
	getDragOverrides: GetDragOverrides;
	getCodeValues: GetCodeValues;
}): React.CSSProperties => ({
	height:
		getExpandedTrackHeight({
			sequence,
			nodePath,
			getIsExpanded,
			getDragOverrides,
			getCodeValues,
		}) + TIMELINE_ITEM_BORDER_BOTTOM,
});

export const TimelineTracks: React.FC<{
	readonly timeline: TrackWithHash[];
	readonly hasBeenCut: boolean;
}> = ({timeline, hasBeenCut}) => {
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {getDragOverrides, getCodeValues} = useContext(
		Internals.VisualModeGettersContext,
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

					const isExpanded =
						track.nodePath !== null && getIsExpanded(track.nodePath);

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
							{visualModeEnabled && isExpanded && track.nodePath ? (
								<div
									style={getExpandedPlaceholderStyle({
										sequence: track.sequence,
										nodePath: track.nodePath,
										getIsExpanded,
										getDragOverrides,
										getCodeValues,
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
