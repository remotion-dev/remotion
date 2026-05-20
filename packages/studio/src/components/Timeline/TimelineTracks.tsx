import React, {useContext, useMemo} from 'react';
import type {CodeValues} from 'remotion';
import {Internals, type TSequence} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {
	SequenceNodePathInfo,
	TrackWithHash,
} from '../../helpers/get-timeline-sequence-sort-key';
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
import {MaxTimelineTracksReached} from './MaxTimelineTracks';
import {TimelineSequence} from './TimelineSequence';
import {TimelineTimePadding} from './TimelineTimeIndicators';

const content: React.CSSProperties = {
	paddingLeft: TIMELINE_PADDING,
	paddingRight: TIMELINE_PADDING,
};

const timelineContent: React.CSSProperties = {
	minHeight: '100%',
};

const getExpandedPlaceholderStyle = ({
	sequence,
	nodePathInfo,
	getIsExpanded,
	codeValues,
}: {
	sequence: TSequence;
	nodePathInfo: SequenceNodePathInfo;
	getIsExpanded: GetIsExpanded;
	codeValues: CodeValues;
}): React.CSSProperties => ({
	height:
		getExpandedTrackHeight({
			sequence,
			nodePathInfo,
			getIsExpanded,
			codeValues,
		}) + TIMELINE_ITEM_BORDER_BOTTOM,
});

const TimelineTracksInner: React.FC<{
	readonly timeline: TrackWithHash[];
	readonly hasBeenCut: boolean;
}> = ({timeline, hasBeenCut}) => {
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {codeValues} = useContext(Internals.VisualModeCodeValuesContext);

	const previewServerConnected = previewServerState.type === 'connected';

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
					const isExpanded =
						track.nodePathInfo !== null && getIsExpanded(track.nodePathInfo);

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
							{isExpanded && track.nodePathInfo && previewServerConnected ? (
								<div
									style={getExpandedPlaceholderStyle({
										sequence: track.sequence,
										nodePathInfo: track.nodePathInfo,
										getIsExpanded,
										codeValues,
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

export const TimelineTracks = React.memo(TimelineTracksInner);
