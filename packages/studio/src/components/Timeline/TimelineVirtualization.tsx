import {
	defaultRangeExtractor,
	type Range,
	type VirtualItem,
	useVirtualizer,
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
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_ITEM_BORDER_BOTTOM} from '../../helpers/timeline-layout';
import {MAX_TIMELINE_TRACKS_NOTICE_HEIGHT} from './MaxTimelineTracks';
import {timelineVerticalScroll} from './timeline-refs';
import {
	getTimelineSequenceSelectionKey,
	type TimelineSelection,
	useTimelineSelection,
} from './TimelineSelection';
import {TIMELINE_TIME_INDICATOR_HEIGHT} from './TimelineTimeIndicators';
import {useTimelineTrackHeights} from './use-timeline-height';

export type TimelineVirtualRow = {
	readonly afterDropLineOffset: number;
	readonly siblingIndex: number;
	readonly track: TimelineTrackData;
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
	readonly timeline: readonly TimelineTrackData[];
}> = ({children, hasBeenCut, isStill, timeline}) => {
	const trackHeights = useTimelineTrackHeights({timeline});
	const {registerRevealHandler, selectedItems} = useTimelineSelection();
	const paddingStart = isStill ? 0 : TIMELINE_TIME_INDICATOR_HEIGHT;
	const paddingEnd =
		TIMELINE_ITEM_BORDER_BOTTOM +
		(hasBeenCut ? MAX_TIMELINE_TRACKS_NOTICE_HEIGHT : 0);

	const layout = useMemo(() => {
		const siblingIndexes = new Array<number>(timeline.length);
		const subtreeEndIndexes = new Array<number>(timeline.length).fill(
			timeline.length,
		);
		const openTracks: Array<{depth: number; index: number}> = [];
		const siblingCounts = new Map<number | null, number>();

		for (let index = 0; index < timeline.length; index++) {
			const {depth} = timeline[index];
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
			(track, index): TimelineVirtualRow => ({
				afterDropLineOffset: offsets[subtreeEndIndexes[index]] - offsets[index],
				siblingIndex: siblingIndexes[index],
				track,
			}),
		);
		const rootTrackIndexes = new Map<string, number>();
		for (let index = 0; index < timeline.length; index++) {
			const {nodePathInfo} = timeline[index];
			if (nodePathInfo !== null) {
				rootTrackIndexes.set(
					getTimelineSequenceSelectionKey(nodePathInfo),
					index,
				);
			}
		}

		return {
			rootTrackIndexes,
			rows,
			tracksEnd: offsets[offsets.length - 1],
		};
	}, [paddingStart, timeline, trackHeights]);

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
	const getItemKey = useCallback(
		(index: number) => timelineRef.current[index]?.sequence.id ?? index,
		[],
	);
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
		overscan: 8,
		paddingEnd,
		paddingStart,
		rangeExtractor,
	});

	useLayoutEffect(() => {
		virtualizer.measure();
	}, [trackHeights, virtualizer]);

	useEffect(() => {
		return registerRevealHandler((selection) => {
			const key = getSelectionTrackKey(selection);
			const index = key === null ? undefined : layout.rootTrackIndexes.get(key);
			if (index !== undefined) {
				virtualizer.scrollToIndex(index, {align: 'auto'});
			}
		});
	}, [layout.rootTrackIndexes, registerRevealHandler, virtualizer]);

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
