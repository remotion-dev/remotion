import React from 'react';
import {BACKGROUND} from '../../helpers/colors';
import {TimelineSequenceItem} from './TimelineSequenceItem';
import {
	type TimelineVirtualRow,
	useTimelineVirtualization,
} from './TimelineVirtualization';

const container: React.CSSProperties = {
	flex: 1,
	background: BACKGROUND,
	position: 'relative',
};

const TimelineListTrack: React.FC<{
	readonly row: TimelineVirtualRow;
}> = ({row}) => {
	const {afterDropLineOffset, siblingIndex, track} = row;

	return (
		<TimelineSequenceItem
			afterDropLineOffset={afterDropLineOffset}
			siblingIndex={siblingIndex}
			connectedCompositions={track.connectedCompositions ?? []}
			nestedDepth={track.depth}
			sequence={track.sequence}
			nodePathInfo={track.nodePathInfo}
			keyframeDisplayOffset={track.keyframeDisplayOffset}
			sequenceFrameOffset={track.sequenceFrameOffset}
		/>
	);
};

export const TimelineList: React.FC = () => {
	const {rows, tracksEnd, virtualItems} = useTimelineVirtualization();

	return (
		<div style={{...container, height: tracksEnd}}>
			{virtualItems.map((virtualItem) => (
				<div
					key={virtualItem.key}
					style={{
						height: virtualItem.size,
						left: 0,
						position: 'absolute',
						top: virtualItem.start,
						width: '100%',
					}}
				>
					<TimelineListTrack row={rows[virtualItem.index]} />
				</div>
			))}
		</div>
	);
};
