import React, {useContext, useLayoutEffect, useMemo, useRef} from 'react';
import type {TSequence} from 'remotion';
import {TIMELINE_TRACK_SEPARATOR} from '../../helpers/colors';
import {TIMELINE_ITEM_BORDER_BOTTOM} from '../../helpers/timeline-layout';
import {getTimelineSceneRange} from './get-timeline-scene-range';
import {
	getTimelineTransitionRangesByStart,
	type TimelineTransitionRange,
} from './get-timeline-transition-ranges';
import type {TimelineTrackWithDisplayGroup} from './timeline-display-groups';
import {
	TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT,
	TIMELINE_PACKED_TRACK_HEIGHT,
} from './timeline-track-groups';
import {TimelineSceneRangeContext} from './TimelineSceneRangeContext';
import {TimelineSequence} from './TimelineSequence';
import {useSeriesReorder} from './use-series-reorder';

const noConnectedCompositions = [] as const;
const primaryRowHeight =
	TIMELINE_PACKED_TRACK_HEIGHT + TIMELINE_ITEM_BORDER_BOTTOM;

// Reorder feedback only changes the indicator. Keep each clip's context and
// contents stable while its item, neighbors, and row geometry are unchanged.
const TimelinePackedTrackItem: React.FC<{
	readonly item: TimelineTrackWithDisplayGroup;
	readonly previous: TSequence | null;
	readonly next: TSequence | null;
	readonly transitionRangesByStart: ReadonlyMap<
		number,
		TimelineTransitionRange
	>;
	readonly top: number;
	readonly height: number;
}> = React.memo(
	({item, previous, next, transitionRangesByStart, top, height}) => {
		const parentSceneRange = useContext(TimelineSceneRangeContext);
		return (
			<TimelineSceneRangeContext.Provider
				value={
					item.sequence.timelineTrack?.role === 'clip'
						? getTimelineSceneRange({
								sequence: item.sequence,
								transitionRangesByStart,
								previous,
								next,
								// The containing row already clips the parent transition.
								range: parentSceneRange
									? {
											...parentSceneRange,
											transitionInEnd: null,
											transitionOutStart: null,
										}
									: null,
							})
						: parentSceneRange
				}
			>
				<div
					data-timeline-track-item-id={item.sequence.id}
					style={{
						position: 'absolute',
						zIndex:
							item.sequence.timelineTrack?.role === 'transition'
								? 1
								: item.sequence.controls?.componentIdentity ===
									  'dev.remotion.transitions.TransitionSeries.Sequence'
									? undefined
									: 0,
						top,
						left: 0,
						// The clip supplies its own pixel width. Empty row space must
						// not intercept clicks on other clips or the marquee.
						width: 0,
						height: height - TIMELINE_ITEM_BORDER_BOTTOM,
					}}
				>
					<TimelineSequence
						s={item.sequence}
						labelStartFrame={null}
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
			</TimelineSceneRangeContext.Provider>
		);
	},
);

export const TimelinePackedTrack: React.FC<{
	readonly track: TimelineTrackWithDisplayGroup;
	readonly items: readonly TimelineTrackWithDisplayGroup[];
	readonly auxiliaryRowOffsets: readonly number[];
	readonly auxiliaryRows: readonly (readonly TimelineTrackWithDisplayGroup[])[];
}> = ({track, items, auxiliaryRows, auxiliaryRowOffsets}) => {
	const {dropIndicatorLeft, onClickCapture, onPointerDownCapture} =
		useSeriesReorder(items);
	const previousTransitionRangesRef = useRef<
		readonly TimelineTransitionRange[]
	>([]);
	const {rows, transitionRanges} = useMemo(() => {
		const clips = items
			.filter((item) => item.sequence.timelineTrack?.role === 'clip')
			.sort((a, b) => a.sequence.from - b.sequence.from);
		const transitions = items
			.filter((item) => item.sequence.timelineTrack?.role === 'transition')
			.sort((a, b) => a.sequence.from - b.sequence.from);
		const nextTransitionRanges = transitions.map(({sequence}) => ({
			id: sequence.id,
			from: sequence.from,
			end: sequence.from + sequence.duration,
		}));
		const previousTransitionRanges = previousTransitionRangesRef.current;
		// A clip edit need not invalidate the transition context of every sibling.
		const stableTransitionRanges =
			previousTransitionRanges.length === nextTransitionRanges.length &&
			nextTransitionRanges.every(
				(range, index) =>
					range.id === previousTransitionRanges[index].id &&
					range.from === previousTransitionRanges[index].from &&
					range.end === previousTransitionRanges[index].end,
			)
				? previousTransitionRanges
				: nextTransitionRanges;
		return {
			rows: [[...clips, ...transitions], ...auxiliaryRows].map(
				(row, index) => ({
					items: row,
					top: index === 0 ? 0 : auxiliaryRowOffsets[index - 1],
					height:
						index === 0
							? primaryRowHeight
							: TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT,
				}),
			),
			transitionRanges: stableTransitionRanges,
		};
	}, [auxiliaryRows, auxiliaryRowOffsets, items]);
	useLayoutEffect(() => {
		previousTransitionRangesRef.current = transitionRanges;
	}, [transitionRanges]);
	const transitionRangesByStart = useMemo(
		() => getTimelineTransitionRangesByStart(transitionRanges),
		[transitionRanges],
	);

	return (
		<div
			data-timeline-track={track.sequence.displayName}
			onClickCapture={onClickCapture}
			onPointerDownCapture={onPointerDownCapture}
			style={{
				position: 'relative',
				// Keep clip stacking inside the track, below the pinned timeline ruler.
				isolation: 'isolate',
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
					<TimelinePackedTrackItem
						key={item.sequence.id}
						item={item}
						previous={row.items[index - 1]?.sequence ?? null}
						next={
							row.items[index + 1]?.sequence.timelineTrack?.role === 'clip'
								? row.items[index + 1].sequence
								: null
						}
						transitionRangesByStart={transitionRangesByStart}
						top={row.top}
						height={row.height}
					/>
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
