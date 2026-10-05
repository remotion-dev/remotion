import React, {useMemo} from 'react';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {MaxTimelineTracksReached} from './MaxTimelineTracks';
import {TimelinePackedTrack} from './TimelinePackedTrack';
import {TimelineTrack} from './TimelineTrack';
import {useTimelineVirtualization} from './TimelineVirtualization';

const content: React.CSSProperties = {
	paddingLeft: TIMELINE_PADDING,
	paddingRight: TIMELINE_PADDING,
	position: 'relative',
};

const timelineContent: React.CSSProperties = {
	minHeight: '100%',
};

const TimelineTracksInner: React.FC<{
	readonly hasBeenCut: boolean;
}> = ({hasBeenCut}) => {
	const {rows, tracksEnd, virtualItems} = useTimelineVirtualization();
	const timelineStyle: React.CSSProperties = useMemo(() => {
		return {
			...timelineContent,
			width: 100 + '%',
		};
	}, []);

	return (
		<div style={timelineStyle} {...{'oai-annotation-container': ''}}>
			<div style={{...content, height: tracksEnd}}>
				{virtualItems.map((virtualItem) => (
					<div
						key={virtualItem.key}
						style={{
							height: virtualItem.size,
							left: TIMELINE_PADDING,
							position: 'absolute',
							right: TIMELINE_PADDING,
							top: virtualItem.start,
						}}
					>
						{rows[virtualItem.index].items === null ? (
							<TimelineTrack track={rows[virtualItem.index].track} />
						) : (
							<TimelinePackedTrack
								track={rows[virtualItem.index].track}
								items={rows[virtualItem.index].items!}
							/>
						)}
					</div>
				))}
			</div>
			{hasBeenCut ? <MaxTimelineTracksReached /> : null}
		</div>
	);
};

export const TimelineTracks = React.memo(TimelineTracksInner);
