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
	readonly auxiliaryRows: readonly (readonly TimelineTrackWithDisplayGroup[])[];
}> = ({track, items, auxiliaryRows}) => {
	const {dropIndicatorLeft, onClickCapture, onPointerDownCapture} =
		useSeriesReorder(items);
	const labelStartFrames = useMemo(() => {
		const starts = new Map<string, number>();
		let precedingTransition: TimelineTrackWithDisplayGroup['sequence'] | null =
			null;
		// Match transitions to their incoming clips before reordering for painting.
		for (const {sequence} of items) {
			if (sequence.timelineTrack?.role === 'transition') {
				precedingTransition = sequence;
			} else if (sequence.timelineTrack?.role === 'clip') {
				if (
					precedingTransition !== null &&
					precedingTransition.from < sequence.from + sequence.duration &&
					precedingTransition.from + precedingTransition.duration >
						sequence.from
				) {
					starts.set(
						sequence.id,
						precedingTransition.from + precedingTransition.duration,
					);
				}

				precedingTransition = null;
			}
		}

		return starts;
	}, [items]);
	const rows = useMemo(() => {
		const clips = items.filter(
			(item) => item.sequence.timelineTrack?.role === 'clip',
		);
		const effects = items.filter(
			(item) =>
				item.sequence.timelineTrack?.role !== 'clip' &&
				item.sequence.timelineTrack?.role !== 'overlay',
		);
		return [[...clips, ...effects], ...auxiliaryRows].map((row, index) => ({
			items: row,
			top:
				index === 0
					? 0
					: primaryRowHeight +
						(index - 1) * TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT,
			height:
				index === 0 ? primaryRowHeight : TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT,
		}));
	}, [auxiliaryRows, items]);

	return (
		<div
			data-timeline-track={track.sequence.displayName}
			onClickCapture={onClickCapture}
			onPointerDownCapture={onPointerDownCapture}
			style={{
				position: 'relative',
				height:
					primaryRowHeight +
					auxiliaryRows.length * TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT,
			}}
		>
			{rows.map((row) => (
				<div
					key={row.top}
					aria-hidden="true"
					data-timeline-track-row={row.top === 0 ? 'clips' : 'overlays'}
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
				row.items.map((item) => (
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
							labelStartFrame={labelStartFrames.get(item.sequence.id) ?? null}
							cascadedStart={item.cascadedStart}
							localStart={item.localStart}
							parentVisibleStart={item.parentVisibleStart ?? 0}
							parentVisibleEnd={item.parentVisibleEnd ?? null}
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
