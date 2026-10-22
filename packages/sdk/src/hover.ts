import type {Dispatch, SetStateAction} from 'react';
import {useCallback, useMemo} from 'react';
import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';
import {getCanvasSequenceSelectionKey} from './selection';
import {timelineSequenceNodePathToKey} from './timeline-sequence-node-path-to-key';
import {useSyncExternalStore} from './use-sync-external-store';

export type CanvasHover = {
	readonly key: string;
	readonly nodePathKey: string;
	readonly source: 'canvas' | 'timeline';
};

export type CanvasHoverController = {
	readonly getSnapshot: () => CanvasHover | null;
	readonly subscribe: (listener: () => void) => () => void;
	readonly setHoveredSequence: Dispatch<SetStateAction<CanvasHover | null>>;
	readonly clear: (source: CanvasHover['source'] | null) => void;
};

export const createCanvasHoverController = (): CanvasHoverController => {
	let hoveredSequence: CanvasHover | null = null;
	const listeners = new Set<() => void>();
	const setHoveredSequence: CanvasHoverController['setHoveredSequence'] = (
		action,
	) => {
		const nextHoveredSequence =
			typeof action === 'function' ? action(hoveredSequence) : action;
		if (
			nextHoveredSequence === hoveredSequence ||
			(nextHoveredSequence !== null &&
				hoveredSequence !== null &&
				nextHoveredSequence.key === hoveredSequence.key &&
				nextHoveredSequence.nodePathKey === hoveredSequence.nodePathKey &&
				nextHoveredSequence.source === hoveredSequence.source)
		) {
			return;
		}

		hoveredSequence = nextHoveredSequence;
		for (const listener of listeners) {
			listener();
		}
	};

	return {
		getSnapshot: () => hoveredSequence,
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		setHoveredSequence,
		clear: (source) => {
			if (source === null || hoveredSequence?.source === source) {
				setHoveredSequence(null);
			}
		},
	};
};

export const useCanvasHover = (
	controller: CanvasHoverController,
): CanvasHover | null => {
	return useSyncExternalStore(
		controller.subscribe,
		controller.getSnapshot,
		controller.getSnapshot,
	);
};

export const useIsCanvasSequenceHovered = (
	controller: CanvasHoverController,
	nodePathKey: string | null,
): boolean => {
	const getSnapshot = useCallback(
		() =>
			nodePathKey !== null &&
			controller.getSnapshot()?.nodePathKey === nodePathKey,
		[controller, nodePathKey],
	);

	return useSyncExternalStore(controller.subscribe, getSnapshot, getSnapshot);
};

export const useCanvasSequenceHover = (
	controller: CanvasHoverController,
	nodePathInfo: SequenceNodePathInfo | null,
	source: CanvasHover['source'],
) => {
	const sequenceKey = useMemo(
		() =>
			nodePathInfo === null
				? null
				: getCanvasSequenceSelectionKey(nodePathInfo),
		[nodePathInfo],
	);
	const nodePathKey = useMemo(
		() =>
			nodePathInfo === null
				? null
				: timelineSequenceNodePathToKey(nodePathInfo.sequenceSubscriptionKey),
		[nodePathInfo],
	);
	const hovered = useIsCanvasSequenceHovered(controller, nodePathKey);

	const onPointerEnter = useCallback(() => {
		if (sequenceKey === null || nodePathKey === null) {
			return;
		}

		controller.setHoveredSequence({
			key: sequenceKey,
			nodePathKey,
			source,
		});
	}, [controller, nodePathKey, sequenceKey, source]);

	const onPointerLeave = useCallback(() => {
		controller.setHoveredSequence((currentHover) => {
			if (
				currentHover?.source !== source ||
				currentHover.key !== sequenceKey ||
				currentHover.nodePathKey !== nodePathKey
			) {
				return currentHover;
			}

			return null;
		});
	}, [controller, nodePathKey, sequenceKey, source]);

	return useMemo(
		() => ({hovered, onPointerEnter, onPointerLeave}),
		[hovered, onPointerEnter, onPointerLeave],
	);
};
