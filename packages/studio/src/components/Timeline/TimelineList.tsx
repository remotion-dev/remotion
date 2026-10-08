import React from 'react';
import {Internals} from 'remotion';
import {BACKGROUND, TIMELINE_TRACK_SEPARATOR} from '../../helpers/colors';
import {TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT} from './timeline-track-groups';
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
	readonly start: number;
	readonly height: number;
}> = React.memo(({row, start, height}) => {
	const {afterDropLineOffset, siblingIndex, track} = row;

	return (
		<div
			style={{height, left: 0, position: 'absolute', top: start, width: '100%'}}
		>
			<TimelineSequenceItem
				showBottomBorder={row.auxiliaryRows.length === 0}
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
				numberOfHiddenDuplicates={
					row.items !== null
						? 0
						: Math.max(0, (track.displayGroup?.numberOfSequences ?? 1) - 1)
				}
				showProvisionalVisibilityToggle={
					track.nodePathInfo === null && track.displayGroup !== null
				}
			/>
			{row.auxiliaryRows.length > 0 ? (
				<div
					aria-hidden="true"
					style={{
						height:
							row.auxiliaryRows.length * TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT,
						borderBottom: `1px solid ${TIMELINE_TRACK_SEPARATOR}`,
					}}
				/>
			) : null}
		</div>
	);
});

// Only labels follow the playhead. The rows and the bars keep their layout.
const TimelineSceneListTrack: React.FC<
	React.ComponentProps<typeof TimelineListTrack>
> = React.memo((props) => {
	const {row} = props;
	const frame = Internals.Timeline.useTimelinePosition();
	if (
		row.sceneRange === null ||
		frame < row.sceneRange.from ||
		frame >= row.sceneRange.end
	) {
		return null;
	}

	return <TimelineListTrack {...props} />;
});

export const TimelineList: React.FC = () => {
	const {rows, tracksEnd, virtualItems} = useTimelineVirtualization();

	return (
		<div
			style={{...container, height: tracksEnd}}
			{...{'oai-annotation-container': ''}}
		>
			<style>{`.remotion-timeline-sequence-name-measure::before {
				content: attr(data-name);
				display: block;
				font-family: Arial, Helvetica, sans-serif;
				font-size: 12px;
				line-height: normal;
				visibility: hidden;
			}`}</style>
			{virtualItems.map((virtualItem) =>
				rows[virtualItem.index].sceneRange === null ? (
					<TimelineListTrack
						key={virtualItem.key}
						row={rows[virtualItem.index]}
						start={virtualItem.start}
						height={virtualItem.size}
					/>
				) : (
					<TimelineSceneListTrack
						key={virtualItem.key}
						row={rows[virtualItem.index]}
						start={virtualItem.start}
						height={virtualItem.size}
					/>
				),
			)}
		</div>
	);
};
