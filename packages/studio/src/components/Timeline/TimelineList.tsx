import React from 'react';
import {BACKGROUND, TIMELINE_TRACK_SEPARATOR} from '../../helpers/colors';
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

const noConnectedCompositions: readonly never[] = [];

const TimelineListTrack: React.FC<{
	readonly row: TimelineVirtualRow;
}> = React.memo(({row}) => {
	const {afterDropLineOffset, siblingIndex, track} = row;

	return (
		<TimelineSequenceItem
			afterDropLineOffset={afterDropLineOffset}
			siblingIndex={siblingIndex}
			connectedCompositions={
				track.connectedCompositions ?? noConnectedCompositions
			}
			nestedDepth={track.depth}
			sequence={track.sequence}
			nodePathInfo={track.nodePathInfo}
			keyframeDisplayOffset={track.keyframeDisplayOffset}
			keyframePlaybackRate={track.keyframePlaybackRate}
			sequenceFrameOffset={track.sequenceFrameOffset}
			numberOfHiddenDuplicates={Math.max(
				0,
				(track.displayGroup?.numberOfSequences ?? 1) - 1,
			)}
			showProvisionalVisibilityToggle={
				track.nodePathInfo === null && track.displayGroup !== null
			}
		/>
	);
});

export const TimelineList: React.FC = () => {
	const {rows, tracksEnd, virtualItems} = useTimelineVirtualization();

	return (
		<div style={{...container, height: tracksEnd}}>
			<style>{`.remotion-timeline-list-row-border::after,
			.remotion-timeline-list-expanded-section::before {
				content: '';
				position: absolute;
				left: 0;
				right: 0;
				height: 0;
				border-bottom: 1px solid ${TIMELINE_TRACK_SEPARATOR};
				pointer-events: none;
				z-index: 1;
			}
			.remotion-timeline-list-row-border::after {
				bottom: 0;
			}
			.remotion-timeline-list-expanded-section::before {
				top: 0;
			}
			.remotion-timeline-sequence-name-measure::before {
				content: attr(data-name);
				display: block;
				font-family: Arial, Helvetica, sans-serif;
				font-size: 12px;
				line-height: normal;
				visibility: hidden;
			}`}</style>
			{virtualItems.map((virtualItem) => (
				<div
					key={virtualItem.key}
					className="remotion-timeline-list-row-border"
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
