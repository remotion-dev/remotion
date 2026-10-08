import {
	defaultRangeExtractor,
	type Range,
	useVirtualizer,
	type VirtualItem,
} from '@tanstack/react-virtual';
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
} from 'react';
import {Internals} from 'remotion';
import {getStudioShowPremounting} from '../../helpers/studio-runtime-config';
import {TIMELINE_ITEM_BORDER_BOTTOM} from '../../helpers/timeline-layout';
import {MAX_TIMELINE_TRACKS_NOTICE_HEIGHT} from './MaxTimelineTracks';
import {timelineVerticalScroll} from './timeline-refs';
import {
	getTimelineSeriesLayout,
	type TimelineSceneRange,
} from './timeline-series-layout';
import {
	TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT,
	TIMELINE_PACKED_TRACK_HEIGHT,
	type TimelineDisplayRow,
} from './timeline-track-groups';
import {
	getTimelineSelectionKey,
	getTimelineSequenceSelectionKey,
	type TimelineSelection,
	useTimelineSelection,
} from './TimelineSelection';
import {TIMELINE_TIME_INDICATOR_HEIGHT} from './TimelineTimeIndicators';
import {useTimelineTrackHeights} from './use-timeline-height';

export type TimelineVirtualRow = TimelineDisplayRow & {
	readonly afterDropLineOffset: number;
	readonly siblingIndex: number;
	readonly sceneRange: TimelineSceneRange | null;
	readonly sceneGroupId: string | null;
};

type TimelineVirtualizationContextValue = {
	readonly rows: readonly TimelineVirtualRow[];
	readonly totalSize: number;
	readonly tracksEnd: number;
	readonly virtualItems: readonly VirtualItem[];
};

const TimelineVirtualizationContext =
	createContext<TimelineVirtualizationContextValue | null>(null);
const TimelineRowsRefContext = createContext<React.RefObject<
	readonly TimelineVirtualRow[]
> | null>(null);

const getSelectionTrackKey = (selection: TimelineSelection): string | null => {
	if (selection.type === 'guide') {
		return null;
	}

	return getTimelineSequenceSelectionKey(selection.nodePathInfo);
};

export const TimelineVirtualizationProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly hasBeenCut: boolean;
	readonly isStill: boolean;
	readonly timeline: readonly TimelineDisplayRow[];
}> = ({children, hasBeenCut, isStill, timeline}) => {
	const sequences = Internals.useSequenceManagerSequences();
	const experimentalTracks = useContext(
		Internals.ExperimentalTracksEnabledContext,
	);
	const activitySettings = useContext(
		Internals.SequenceActivitySettingsContext,
	);
	const compactSeries =
		experimentalTracks &&
		activitySettings?.enabled === true &&
		!getStudioShowPremounting();
	const representativeTracks = useMemo(
		() => timeline.map((row) => row.track),
		[timeline],
	);
	const individualHeights = useTimelineTrackHeights({
		timeline: representativeTracks,
	});
	const trackHeights = useMemo(
		() =>
			timeline.map((row, index) =>
				row.items === null
					? individualHeights[index]
					: TIMELINE_PACKED_TRACK_HEIGHT +
						TIMELINE_ITEM_BORDER_BOTTOM +
						row.auxiliaryRows.length * TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT,
			),
		[individualHeights, timeline],
	);
	const {consumeRevealRequest, revealRequest, selectedItems} =
		useTimelineSelection();
	const paddingStart = isStill ? 0 : TIMELINE_TIME_INDICATOR_HEIGHT;
	const paddingEnd =
		TIMELINE_ITEM_BORDER_BOTTOM +
		(hasBeenCut ? MAX_TIMELINE_TRACKS_NOTICE_HEIGHT : 0);
	const rowsRef = useRef<readonly TimelineVirtualRow[]>([]);

	const layout = useMemo(() => {
		const seriesLayout = getTimelineSeriesLayout({
			rows: timeline,
			heights: trackHeights,
			sequences,
			compactSeries,
			paddingStart,
		});

		const rows = timeline.map(
			({track, items, auxiliaryRows}, index): TimelineVirtualRow => {
				const afterDropLineOffset = seriesLayout.afterDropLineOffsets[index];
				const siblingIndex = seriesLayout.siblingIndexes[index];
				const sceneRange = seriesLayout.sceneRanges[index];
				const sceneGroupId =
					sceneRange === null
						? null
						: timeline[
								seriesLayout.groups[seriesLayout.groupIndexes[index]].index
							].track.sequence.id;
				const previous = rowsRef.current[index];
				if (
					previous?.track === track &&
					previous.items === items &&
					previous.auxiliaryRows === auxiliaryRows &&
					previous.afterDropLineOffset === afterDropLineOffset &&
					previous.siblingIndex === siblingIndex &&
					previous.sceneGroupId === sceneGroupId &&
					previous.sceneRange?.from === sceneRange?.from &&
					previous.sceneRange?.end === sceneRange?.end
				) {
					return previous;
				}

				return {
					afterDropLineOffset,
					siblingIndex,
					track,
					items,
					auxiliaryRows,
					sceneRange,
					sceneGroupId,
				};
			},
		);
		const rootTrackIndexes = new Map<string, number>();
		for (let index = 0; index < timeline.length; index++) {
			for (const {nodePathInfo} of [
				timeline[index].track,
				...(timeline[index].items ?? []),
			]) {
				if (nodePathInfo !== null) {
					rootTrackIndexes.set(
						getTimelineSequenceSelectionKey(nodePathInfo),
						index,
					);
				}
			}
		}

		return {
			...seriesLayout,
			rootTrackIndexes,
			rows,
		};
	}, [compactSeries, paddingStart, sequences, timeline, trackHeights]);
	useLayoutEffect(() => {
		rowsRef.current = layout.rows;
	}, [layout.rows]);

	const selectedTrackIndexes = useMemo(() => {
		const indexes = new Set<number>();
		if (selectedItems.length !== 1) {
			return indexes;
		}

		for (const selectedItem of selectedItems) {
			const key = getSelectionTrackKey(selectedItem);
			const index = key === null ? undefined : layout.rootTrackIndexes.get(key);
			if (index !== undefined) {
				indexes.add(layout.groupIndexes[index]);
			}
		}

		return indexes;
	}, [layout.groupIndexes, layout.rootTrackIndexes, selectedItems]);
	const groupsRef = useRef(layout.groups);
	groupsRef.current = layout.groups;
	const timelineRef = useRef(timeline);
	timelineRef.current = timeline;
	const groupHeights = useMemo(
		() => layout.groups.map((group) => group.height),
		[layout.groups],
	);

	const estimateSize = useCallback(
		(index: number) => groupsRef.current[index]?.height ?? 0,
		[],
	);
	const getItemKey = useCallback((index: number) => {
		const group = groupsRef.current[index];
		return group === undefined
			? index
			: timelineRef.current[group.index].track.sequence.id;
	}, []);
	const rangeExtractor = useCallback(
		(range: Range) => {
			const indexes = new Set(defaultRangeExtractor(range));
			for (const selectedIndex of selectedTrackIndexes) {
				indexes.add(selectedIndex);
			}

			return [...indexes].sort((a, b) => a - b);
		},
		[selectedTrackIndexes],
	);
	const getScrollElement = useCallback(
		() => timelineVerticalScroll.current,
		[],
	);

	const virtualizer = useVirtualizer({
		count: layout.groups.length,
		estimateSize,
		getItemKey,
		getScrollElement,
		overscan: 20,
		paddingEnd,
		paddingStart,
		rangeExtractor,
	});
	const measuredLayoutRef = useRef<{
		readonly heights: readonly number[];
		readonly keys: readonly (string | number)[];
	} | null>(null);

	useLayoutEffect(() => {
		const previous = measuredLayoutRef.current;
		const keys = groupHeights.map((_, index) => getItemKey(index));
		// Trimming changes timeline metadata without changing row geometry. Only
		// invalidate measurements when heights or the cached row identities change.
		if (
			previous !== null &&
			previous.heights.length === groupHeights.length &&
			groupHeights.every(
				(height, index) =>
					previous.heights[index] === height &&
					previous.keys[index] === keys[index],
			)
		) {
			return;
		}

		measuredLayoutRef.current = {heights: groupHeights, keys};
		virtualizer.measure();
	}, [getItemKey, groupHeights, virtualizer]);

	useEffect(() => {
		if (revealRequest === null) {
			return;
		}

		const key = getSelectionTrackKey(revealRequest.item);
		if (key === null) {
			consumeRevealRequest(revealRequest.token);
			return;
		}

		const selectionKey = getTimelineSelectionKey(revealRequest.item);
		if (
			!selectedItems.some(
				(item) => getTimelineSelectionKey(item) === selectionKey,
			)
		) {
			consumeRevealRequest(revealRequest.token);
			return;
		}

		const index = layout.rootTrackIndexes.get(key);
		if (index === undefined) {
			return;
		}

		const row = layout.rows[index];
		const scrollElement = timelineVerticalScroll.current;
		if (scrollElement === null || scrollElement.clientHeight <= paddingStart) {
			return;
		}

		const auxiliaryIndex = row.auxiliaryRows.findIndex((items) =>
			items.some(
				({nodePathInfo}) =>
					nodePathInfo !== null &&
					getTimelineSequenceSelectionKey(nodePathInfo) === key,
			),
		);
		const primaryHeight =
			TIMELINE_PACKED_TRACK_HEIGHT + TIMELINE_ITEM_BORDER_BOTTOM;
		const start =
			layout.offsets[index] +
			(auxiliaryIndex === -1
				? 0
				: primaryHeight +
					auxiliaryIndex * TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT);
		const height =
			auxiliaryIndex !== -1
				? TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT
				: row.items !== null
					? primaryHeight
					: trackHeights[index];
		if (
			start < scrollElement.scrollTop + paddingStart ||
			start + height > scrollElement.scrollTop + scrollElement.clientHeight
		) {
			virtualizer.scrollToOffset(
				start + height / 2 - (scrollElement.clientHeight + paddingStart) / 2,
			);
		}

		consumeRevealRequest(revealRequest.token);
	}, [
		consumeRevealRequest,
		layout.offsets,
		layout.rootTrackIndexes,
		layout.rows,
		paddingStart,
		revealRequest,
		selectedItems,
		trackHeights,
		virtualizer,
	]);

	useEffect(() => {
		if (revealRequest === null) {
			return;
		}

		const scrollElement = timelineVerticalScroll.current;
		if (scrollElement === null) {
			return;
		}

		// A reveal can wait for a row to mount. User scrolling supersedes it.
		const cancelPendingReveal = () => {
			consumeRevealRequest(revealRequest.token);
		};

		const onWheel = (event: WheelEvent) => {
			if (event.deltaY !== 0) {
				cancelPendingReveal();
			}
		};

		const onPointerDown = (event: PointerEvent) => {
			if (event.target === scrollElement) {
				cancelPendingReveal();
			}
		};

		scrollElement.addEventListener('wheel', onWheel, {passive: true});
		scrollElement.addEventListener('touchstart', cancelPendingReveal, {
			passive: true,
		});
		scrollElement.addEventListener('pointerdown', onPointerDown);
		return () => {
			scrollElement.removeEventListener('wheel', onWheel);
			scrollElement.removeEventListener('touchstart', cancelPendingReveal);
			scrollElement.removeEventListener('pointerdown', onPointerDown);
		};
	}, [consumeRevealRequest, revealRequest]);

	const virtualGroups = virtualizer.getVirtualItems();
	const virtualItems = useMemo(
		() =>
			virtualGroups.flatMap((group) =>
				layout.groups[group.index].rows.map(
					(index): VirtualItem => ({
						index,
						key: timeline[index].track.sequence.id,
						start: layout.offsets[index],
						end: layout.offsets[index] + trackHeights[index],
						size: trackHeights[index],
						lane: 0,
					}),
				),
			),
		[layout.groups, layout.offsets, timeline, trackHeights, virtualGroups],
	);
	const value = useMemo(
		(): TimelineVirtualizationContextValue => ({
			rows: layout.rows,
			totalSize: layout.tracksEnd + paddingEnd,
			tracksEnd: layout.tracksEnd,
			virtualItems,
		}),
		[layout.rows, layout.tracksEnd, paddingEnd, virtualItems],
	);

	return (
		<TimelineRowsRefContext.Provider value={rowsRef}>
			<TimelineVirtualizationContext.Provider value={value}>
				{children}
			</TimelineVirtualizationContext.Provider>
		</TimelineRowsRefContext.Provider>
	);
};

export const useTimelineVirtualization = () => {
	const context = useContext(TimelineVirtualizationContext);
	if (context === null) {
		throw new Error(
			'useTimelineVirtualization must be used inside TimelineVirtualizationProvider',
		);
	}

	return context;
};

// Event handlers can read the committed rows without subscribing to viewport changes.
export const useTimelineRowsRef = () => {
	const context = useContext(TimelineRowsRefContext);
	if (context === null) {
		throw new Error(
			'useTimelineRowsRef must be used inside TimelineVirtualizationProvider',
		);
	}

	return context;
};
