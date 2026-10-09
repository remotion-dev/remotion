import React, {useMemo} from 'react';
import {TIMELINE_TRACK_SEPARATOR} from '../../helpers/colors';
import {TIMELINE_ITEM_BORDER_BOTTOM} from '../../helpers/timeline-layout';
import type {TimelineTrackWithDisplayGroup} from './timeline-display-groups';
import {
	TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT,
	TIMELINE_PACKED_TRACK_HEIGHT,
} from './timeline-track-groups';
import {TimelineSequence} from './TimelineSequence';
import {useSeriesReorder} from './use-series-reorder';

const noConnectedCompositions = [] as const;
const primaryRowHeight =
	TIMELINE_PACKED_TRACK_HEIGHT + TIMELINE_ITEM_BORDER_BOTTOM;

export const TimelinePackedTrack: React.FC<{
	readonly track: TimelineTrackWithDisplayGroup;
	readonly items: readonly TimelineTrackWithDisplayGroup[];
	readonly auxiliaryRowOffsets: readonly number[];
	readonly auxiliaryRows: readonly (readonly TimelineTrackWithDisplayGroup[])[];
}> = ({track, items, auxiliaryRows, auxiliaryRowOffsets}) => {
	const {dropIndicatorLeft, onClickCapture, onPointerDownCapture} =
		useSeriesReorder(items);
	const rows = useMemo(() => {
		const clips = items
			.filter((item) => item.sequence.timelineTrack?.role === 'clip')
			.sort((a, b) => a.sequence.from - b.sequence.from);
		return [clips, ...auxiliaryRows].map((row, index) => ({
			items: row,
			top: index === 0 ? 0 : auxiliaryRowOffsets[index - 1],
			height:
				index === 0 ? primaryRowHeight : TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT,
		}));
	}, [auxiliaryRows, auxiliaryRowOffsets, items]);

	return (
		<div
			data-timeline-track={track.sequence.displayName}
			onClickCapture={onClickCapture}
			onPointerDownCapture={onPointerDownCapture}
			style={{
				position: 'relative',
				height: Math.max(
					primaryRowHeight,
					...auxiliaryRowOffsets.map(
						(offset) => offset + TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT,
					),
				),
			}}
		>
			{rows.map((row) => (
				<div
					key={row.top}
					aria-hidden="true"
					data-timeline-track-row={
						row.top === 0 ? 'clips' : row.items[0]?.sequence.timelineTrack?.role
					}
					style={{
						position: 'absolute',
						top: row.top,
						left: 0,
						right: 0,
						height: row.height,
						borderBottom: `${TIMELINE_ITEM_BORDER_BOTTOM}px solid ${TIMELINE_TRACK_SEPARATOR}`,
						pointerEvents: 'none',
					}}
				/>
			))}
			{/* Keep clips under the same parent when timing edits move them to another row. */}
			{rows.flatMap((row) =>
				row.items.map((item, index) => (
					<div
						key={item.sequence.id}
						data-timeline-track-item-id={item.sequence.id}
						style={{
							position: 'absolute',
							top: row.top,
							left: 0,
							// The clip supplies its own pixel width. Empty row space must
							// not intercept clicks on other clips or the marquee.
							width: 0,
							height: row.height - TIMELINE_ITEM_BORDER_BOTTOM,
						}}
					>
						<TimelineSequence
							s={item.sequence}
							labelStartFrame={null}
							paintEndFrame={
								row.top === 0 &&
								(row.items[index + 1]?.sequence.from ?? -Infinity) >
									item.sequence.from
									? (row.items[index + 1]?.sequence.from ?? null)
									: null
							}
							cascadedStart={item.cascadedStart}
							localStart={item.localStart}
							parentVisibleStart={item.parentVisibleStart}
							parentVisibleEnd={item.parentVisibleEnd}
							connectedCompositions={
								item.connectedCompositions ?? noConnectedCompositions
							}
							nodePathInfo={item.nodePathInfo}
							keyframeDisplayOffset={item.keyframeDisplayOffset}
							keyframePlaybackRate={item.keyframePlaybackRate}
							sequenceFrameOffset={item.sequenceFrameOffset}
						/>
					</div>
				)),
			)}
			{dropIndicatorLeft === null ? null : (
				<div
					aria-hidden="true"
					data-series-reorder-indicator
					style={{
						position: 'absolute',
						left: dropIndicatorLeft - 6.5,
						top: 0,
						height: TIMELINE_PACKED_TRACK_HEIGHT,
						width: 13,
						background:
							'linear-gradient(to right, #00E50000, #00E500 6px, #00E500 7px, #00E50000)',
						pointerEvents: 'none',
						zIndex: 2,
					}}
				/>
			)}
		</div>
	);
};
