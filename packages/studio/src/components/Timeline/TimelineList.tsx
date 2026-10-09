import React, {useLayoutEffect, useMemo, useRef, useState} from 'react';
import {Internals} from 'remotion';
import {BACKGROUND, TIMELINE_TRACK_SEPARATOR} from '../../helpers/colors';
import {startSlideViewTransition} from '../../helpers/slide-view-transition';
import {timelineVerticalScroll} from './timeline-refs';
import {TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT} from './timeline-track-groups';
import {TimelineSequenceItem} from './TimelineSequenceItem';
import {TIMELINE_TIME_INDICATOR_HEIGHT} from './TimelineTimeIndicators';
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
			{row.auxiliaryRowOffsets.map((offset) => (
				<div
					key={offset}
					aria-hidden="true"
					style={{
						position: 'absolute',
						top: offset,
						left: 0,
						right: 0,
						height: TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT,
						borderBottom: `1px solid ${TIMELINE_TRACK_SEPARATOR}`,
						pointerEvents: 'none',
					}}
				/>
			))}
		</div>
	);
});

type SceneListGroup = {
	readonly id: string;
	start: number;
	end: number;
	readonly items: React.ComponentProps<typeof TimelineListTrack>[];
};

// Only this child-label surface follows the playhead. Keep a view until the
// browser captures it, then swap all changing Series together in one transition.
const TimelineSceneList: React.FC<{
	readonly groups: readonly SceneListGroup[];
}> = React.memo(({groups}) => {
	const frame = Internals.Timeline.useTimelinePosition();
	const lastFrame = useRef(frame);
	const panels = useRef(new Map<string, HTMLDivElement>());
	const view = groups.map((group) => ({
		id: group.id,
		rows: group.items
			.filter(
				({row}) =>
					row.sceneRange !== null &&
					frame >= row.sceneRange.from &&
					frame < row.sceneRange.end,
			)
			.map(({row}) => row.track.sequence.id),
	}));
	const key = JSON.stringify(view);
	const [displayedView, setDisplayedView] = useState(view);
	const displayedViewRef = useRef(view);
	const latest = useRef({view, frame, previousFrame: frame});
	latest.current = {view, frame, previousFrame: lastFrame.current};

	useLayoutEffect(() => {
		const next = latest.current;
		const previous = displayedViewRef.current;
		const scrollBounds =
			timelineVerticalScroll.current?.getBoundingClientRect();
		const changingPanels = next.view.flatMap((group, index) => {
			const old = previous.find((item) => item.id === group.id);
			const element = panels.current.get(group.id);
			if (
				!element ||
				!scrollBounds ||
				!old ||
				old.rows.length === 0 ||
				group.rows.length === 0 ||
				JSON.stringify(old.rows) === JSON.stringify(group.rows)
			) {
				return [];
			}

			// View-transition snapshots escape ancestor overflow. Clip the overlay
			// to the visible list below the pinned ruler, including while scrolled.
			const bounds = element.getBoundingClientRect();
			const top = Math.max(
				0,
				scrollBounds.top + TIMELINE_TIME_INDICATOR_HEIGHT - bounds.top,
			);
			const bottom = Math.max(0, bounds.bottom - scrollBounds.bottom);
			if (top + bottom >= bounds.height) {
				return [];
			}

			return [
				{
					element,
					name: `remotion-timeline-list-${index}`,
					clipY: {top, bottom},
				},
			];
		});
		const update = () => {
			displayedViewRef.current = next.view;
			setDisplayedView(next.view);
		};

		// Mounting, Activity discovery and layout edits are immediate. Animate
		// only a playhead crossing between two discovered scene views.
		if (changingPanels.length === 0 || next.frame === next.previousFrame) {
			update();
			return;
		}

		const cancel = startSlideViewTransition({
			panels: changingPanels,
			direction: next.frame > next.previousFrame ? 'forward' : 'backward',
			update,
		});
		if (cancel === null) {
			update();
			return;
		}

		return cancel;
	}, [key]);
	useLayoutEffect(() => {
		lastFrame.current = frame;
	}, [frame]);

	return groups.map((group) => {
		const activeRows =
			displayedView.find((item) => item.id === group.id)?.rows ?? [];
		return (
			<div
				key={group.id}
				ref={(element) => {
					if (element === null) {
						panels.current.delete(group.id);
					} else {
						panels.current.set(group.id, element);
					}
				}}
				style={{
					position: 'absolute',
					top: group.start,
					left: 0,
					width: '100%',
					height: group.end - group.start,
				}}
			>
				{group.items
					.filter(({row}) => activeRows.includes(row.track.sequence.id))
					.map(({row, start, height}) => (
						<TimelineListTrack
							key={row.track.sequence.id}
							row={row}
							start={start - group.start}
							height={height}
						/>
					))}
			</div>
		);
	});
});

export const TimelineList: React.FC = () => {
	const {rows, tracksEnd, virtualItems} = useTimelineVirtualization();
	const sceneGroups = useMemo(() => {
		const groups = new Map<string, SceneListGroup>();
		for (const item of virtualItems) {
			const row = rows[item.index];
			if (row.sceneGroupId === null) {
				continue;
			}

			const group = groups.get(row.sceneGroupId) ?? {
				id: row.sceneGroupId,
				start: item.start,
				end: item.end,
				items: [],
			};
			group.start = Math.min(group.start, item.start);
			group.end = Math.max(group.end, item.end);
			group.items.push({row, start: item.start, height: item.size});
			groups.set(row.sceneGroupId, group);
		}

		return [...groups.values()];
	}, [rows, virtualItems]);

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
				) : null,
			)}
			<TimelineSceneList groups={sceneGroups} />
		</div>
	);
};
