import type {Dispatch, SetStateAction} from 'react';
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useSyncExternalStore,
} from 'react';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {
	timelineNodePathInfoToKey,
	timelineSequenceNodePathToKey,
} from '../helpers/timeline-node-path-key';

export type TimelineSequenceHover = {
	readonly key: string;
	readonly nodePathKey: string;
	readonly source: 'canvas' | 'timeline';
};

type TimelineSequenceHoverStore = {
	readonly getSnapshot: () => TimelineSequenceHover | null;
	readonly subscribe: (listener: () => void) => () => void;
	readonly setHoveredSequence: Dispatch<
		SetStateAction<TimelineSequenceHover | null>
	>;
};

export const createTimelineSequenceHoverStore =
	(): TimelineSequenceHoverStore => {
		let hoveredSequence: TimelineSequenceHover | null = null;
		const listeners = new Set<() => void>();

		return {
			getSnapshot: () => hoveredSequence,
			subscribe: (listener) => {
				listeners.add(listener);
				return () => listeners.delete(listener);
			},
			setHoveredSequence: (action) => {
				const nextHoveredSequence =
					typeof action === 'function' ? action(hoveredSequence) : action;
				if (nextHoveredSequence === hoveredSequence) {
					return;
				}

				hoveredSequence = nextHoveredSequence;
				for (const listener of listeners) {
					listener();
				}
			},
		};
	};

export const TimelineSequenceHoverContext =
	createContext<TimelineSequenceHoverStore>(createTimelineSequenceHoverStore());

export const useTimelineSequenceHoverState = () => {
	const store = useContext(TimelineSequenceHoverContext);
	return useSyncExternalStore(
		store.subscribe,
		store.getSnapshot,
		store.getSnapshot,
	);
};

export const useSetTimelineSequenceHover = () => {
	return useContext(TimelineSequenceHoverContext).setHoveredSequence;
};

export const useIsTimelineSequenceHovered = (nodePathKey: string | null) => {
	const store = useContext(TimelineSequenceHoverContext);
	const getSnapshot = useCallback(
		() =>
			nodePathKey !== null && store.getSnapshot()?.nodePathKey === nodePathKey,
		[nodePathKey, store],
	);

	return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
};

export const useTimelineSequenceHover = (
	nodePathInfo: SequenceNodePathInfo | null,
) => {
	const store = useContext(TimelineSequenceHoverContext);
	const sequenceKey = useMemo(
		() =>
			nodePathInfo === null
				? null
				: timelineNodePathInfoToKey({...nodePathInfo, auxiliaryKeys: []}),
		[nodePathInfo],
	);
	const nodePathKey = useMemo(
		() =>
			nodePathInfo === null
				? null
				: timelineSequenceNodePathToKey(nodePathInfo.sequenceSubscriptionKey),
		[nodePathInfo],
	);
	const hovered = useIsTimelineSequenceHovered(nodePathKey);

	const onPointerEnter = useCallback(() => {
		if (sequenceKey === null || nodePathKey === null) {
			return;
		}

		store.setHoveredSequence((currentHover) => {
			if (
				currentHover?.key === sequenceKey &&
				currentHover.nodePathKey === nodePathKey &&
				currentHover.source === 'timeline'
			) {
				return currentHover;
			}

			return {
				key: sequenceKey,
				nodePathKey,
				source: 'timeline',
			};
		});
	}, [nodePathKey, sequenceKey, store]);

	const onPointerLeave = useCallback(() => {
		store.setHoveredSequence((currentHover) => {
			if (
				currentHover?.source !== 'timeline' ||
				currentHover.key !== sequenceKey
			) {
				return currentHover;
			}

			return null;
		});
	}, [sequenceKey, store]);

	return useMemo(
		() => ({hovered, onPointerEnter, onPointerLeave}),
		[hovered, onPointerEnter, onPointerLeave],
	);
};
