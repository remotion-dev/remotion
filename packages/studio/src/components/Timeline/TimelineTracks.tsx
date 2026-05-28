import React, {useContext, useMemo} from 'react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {
	getTimelineLayerHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {ExpandedTracksGetterContext} from '../ExpandedTracksProvider';
import {MaxTimelineTracksReached} from './MaxTimelineTracks';
import {TimelineExpandedTrackKeyframes} from './TimelineExpandedTrackKeyframes';
import {
	getTimelineSelectedTrackHighlightStyle,
	useTimelineSelection,
} from './TimelineSelection';
import {TimelineSequence} from './TimelineSequence';
import {TimelineTimePadding} from './TimelineTimeIndicators';

const content: React.CSSProperties = {
	paddingLeft: TIMELINE_PADDING,
	paddingRight: TIMELINE_PADDING,
};

const timelineContent: React.CSSProperties = {
	minHeight: '100%',
};

const TimelineTracksInner: React.FC<{
	readonly timeline: TrackWithHash[];
	readonly hasBeenCut: boolean;
}> = ({timeline, hasBeenCut}) => {
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const previewServerConnected = previewServerState.type === 'connected';
	const {isSelected} = useTimelineSelection();

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
					const rowSelected =
						track.nodePathInfo !== null &&
						isSelected({type: 'row', nodePathInfo: track.nodePathInfo});

					return (
						<div key={track.sequence.id}>
							<div
								style={{
									height: getTimelineLayerHeight(track.sequence.type),
									marginBottom: TIMELINE_ITEM_BORDER_BOTTOM,
									position: 'relative',
								}}
							>
								{rowSelected ? (
									<div style={getTimelineSelectedTrackHighlightStyle()} />
								) : null}
								<TimelineSequence s={track.sequence} />
							</div>
							{isExpanded && track.nodePathInfo && previewServerConnected ? (
								<TimelineExpandedTrackKeyframes
									sequence={track.sequence}
									nodePathInfo={track.nodePathInfo}
									keyframeDisplayOffset={track.keyframeDisplayOffset}
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
