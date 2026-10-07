import React from 'react';
import {
	BACKGROUND,
	LIGHT_TEXT,
	TIMELINE_TRACK_SEPARATOR,
	WHITE_ALPHA_20,
} from '../../helpers/colors';
import {getTimelineRowLeftChromeWidth} from './timeline-row-layout';
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
}> = React.memo(({row}) => {
	const {afterDropLineOffset, siblingIndex, track} = row;

	return (
		<>
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
					style={{
						height:
							row.auxiliaryRows.length * TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT,
						borderBottom: `1px solid ${TIMELINE_TRACK_SEPARATOR}`,
						paddingLeft: getTimelineRowLeftChromeWidth(track.depth) + 8,
						paddingRight: 8,
						position: 'relative',
						userSelect: 'none',
						WebkitUserSelect: 'none',
					}}
				>
					<div
						aria-hidden="true"
						style={{
							position: 'absolute',
							top: 0,
							left: getTimelineRowLeftChromeWidth(track.depth) - 2,
							width: 6,
							height: TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT / 2,
							borderLeft: `1px solid ${WHITE_ALPHA_20}`,
							borderBottom: `1px solid ${WHITE_ALPHA_20}`,
						}}
					/>
					<div
						style={{
							color: LIGHT_TEXT,
							fontSize: 11,
							lineHeight: `${TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT}px`,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						Overlays
					</div>
				</div>
			) : null}
		</>
	);
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
