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
import {TIMELINE_ITEM_BORDER_BOTTOM} from '../../helpers/timeline-layout';
import {MAX_TIMELINE_TRACKS_NOTICE_HEIGHT} from './MaxTimelineTracks';
import {timelineVerticalScroll} from './timeline-refs';
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
};

type TimelineVirtualizationContextValue = {
	readonly rows: readonly TimelineVirtualRow[];
	readonly totalSize: number;
	readonly tracksEnd: number;
	readonly virtualItems: readonly VirtualItem[];
};

const TimelineVirtualizationContext =
	createContext<TimelineVirtualizationContextValue | null>(null);

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
	const previousRowsRef = useRef<readonly TimelineVirtualRow[]>([]);

	const layout = useMemo(() => {
		const siblingIndexes = new Array<number>(timeline.length);
		const subtreeEndIndexes = new Array<number>(timeline.length).fill(
			timeline.length,
		);
		const openTracks: Array<{depth: number; index: number}> = [];
		const siblingCounts = new Map<number | null, number>();

		for (let index = 0; index < timeline.length; index++) {
			const {depth} = timeline[index].track;
			while (
				openTracks.length > 0 &&
				openTracks[openTracks.length - 1].depth >= depth
			) {
				const completed = openTracks.pop()!;
				subtreeEndIndexes[completed.index] = index;
			}

			const parentIndex = openTracks[openTracks.length - 1]?.index ?? null;
			const siblingIndex = siblingCounts.get(parentIndex) ?? 0;
			siblingIndexes[index] = siblingIndex;
			siblingCounts.set(parentIndex, siblingIndex + 1);
			openTracks.push({depth, index});
		}

		const offsets = new Array<number>(timeline.length + 1);
		offsets[0] = paddingStart;
		for (let index = 0; index < trackHeights.length; index++) {
			offsets[index + 1] = offsets[index] + trackHeights[index];
		}

		const rows = timeline.map(
			({track, items, auxiliaryRows}, index): TimelineVirtualRow => {
				const afterDropLineOffset =
					offsets[subtreeEndIndexes[index]] - offsets[index];
				const siblingIndex = siblingIndexes[index];
				const previous = previousRowsRef.current[index];
				if (
					previous?.track === track &&
					previous.items === items &&
					previous.auxiliaryRows === auxiliaryRows &&
					previous.afterDropLineOffset === afterDropLineOffset &&
					previous.siblingIndex === siblingIndex
				) {
					return previous;
				}

				return {afterDropLineOffset, siblingIndex, track, items, auxiliaryRows};
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
			offsets,
			rootTrackIndexes,
			rows,
			tracksEnd: offsets[offsets.length - 1],
		};
	}, [paddingStart, timeline, trackHeights]);
	useLayoutEffect(() => {
		previousRowsRef.current = layout.rows;
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
				indexes.add(index);
			}
		}

		return indexes;
	}, [layout.rootTrackIndexes, selectedItems]);
	const trackHeightsRef = useRef(trackHeights);
	trackHeightsRef.current = trackHeights;
	const timelineRef = useRef(timeline);
	timelineRef.current = timeline;

	const estimateSize = useCallback(
		(index: number) => trackHeightsRef.current[index] ?? 0,
		[],
	);
	const getItemKey = useCallback((index: number) => {
		const row = timelineRef.current[index];
		return row?.items
			? (row.track.sequence.timelineTrack?.id ?? index)
			: (row?.track.sequence.id ?? index);
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
		count: timeline.length,
		estimateSize,
		getItemKey,
		getScrollElement,
		overscan: 20,
		paddingEnd,
		paddingStart,
		rangeExtractor,
	});

	useLayoutEffect(() => {
		virtualizer.measure();
	}, [trackHeights, virtualizer]);

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
		if (row.items !== null) {
			const scrollElement = timelineVerticalScroll.current;
			if (
				scrollElement === null ||
				scrollElement.clientHeight <= paddingStart
			) {
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
				auxiliaryIndex === -1
					? primaryHeight
					: TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT;
			// A packed Track can exceed the viewport. Reveal the selected lane,
			// allowing for the pinned time ruler, rather than centering its owner.
			if (
				start < scrollElement.scrollTop + paddingStart ||
				start + height > scrollElement.scrollTop + scrollElement.clientHeight
			) {
				virtualizer.scrollToOffset(
					start + height / 2 - (scrollElement.clientHeight + paddingStart) / 2,
				);
			}
		} else {
			const offset = virtualizer.getOffsetForIndex(index, 'auto');
			if (offset === undefined) {
				return;
			}

			if (offset[1] !== 'auto') {
				virtualizer.scrollToIndex(index, {align: 'center'});
			}
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

	const virtualItems = virtualizer.getVirtualItems();
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
		<TimelineVirtualizationContext.Provider value={value}>
			{children}
		</TimelineVirtualizationContext.Provider>
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
