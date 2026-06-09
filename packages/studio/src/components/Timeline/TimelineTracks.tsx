import React, {useMemo} from 'react';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {MaxTimelineTracksReached} from './MaxTimelineTracks';
import {useTimelineMarqueeSelection} from './TimelineSelection';
import {TimelineTimePadding} from './TimelineTimeIndicators';
import {TimelineTrack} from './TimelineTrack';

const content: React.CSSProperties = {
	paddingLeft: TIMELINE_PADDING,
	paddingRight: TIMELINE_PADDING,
};

const timelineContent: React.CSSProperties = {
	minHeight: '100%',
};

const marqueeStyle: React.CSSProperties = {
	backgroundColor: 'rgba(70, 130, 255, 0.16)',
	border: '1px solid rgba(70, 130, 255, 0.75)',
	boxSizing: 'border-box',
	pointerEvents: 'none',
	position: 'fixed',
	zIndex: 10,
};

const TimelineTracksInner: React.FC<{
	readonly timeline: TrackWithHash[];
	readonly hasBeenCut: boolean;
}> = ({timeline, hasBeenCut}) => {
	const {marqueeRect, onPointerDownCapture} = useTimelineMarqueeSelection();
	const timelineStyle: React.CSSProperties = useMemo(() => {
		return {
			...timelineContent,
			width: 100 + '%',
		};
	}, []);

	return (
		<div style={timelineStyle} onPointerDownCapture={onPointerDownCapture}>
			<div style={content}>
				<TimelineTimePadding />
				{timeline.map((track) => (
					<TimelineTrack key={track.sequence.id} track={track} />
				))}
			</div>
			{hasBeenCut ? <MaxTimelineTracksReached /> : null}
			{marqueeRect === null ? null : (
				<div
					style={{
						...marqueeStyle,
						height: marqueeRect.bottom - marqueeRect.top,
						left: marqueeRect.left,
						top: marqueeRect.top,
						width: marqueeRect.right - marqueeRect.left,
					}}
				/>
			)}
		</div>
	);
};

export const TimelineTracks = React.memo(TimelineTracksInner);
