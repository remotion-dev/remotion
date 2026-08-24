import {useState, useSyncExternalStore} from 'react';
import type {TSequence} from 'remotion';
import {calculateTimeline} from './calculate-timeline';
import type {TimelineTrackData} from './get-timeline-sequence-sort-key';
import {
	getCanvasSelectionItemKey,
	type CanvasSelectionItem,
	type CanvasSelectionMode,
	type CanvasSelectionSnapshot,
} from './selection';

export type CanvasController = {
	readonly timeline: {
		readonly getSnapshot: () => readonly TimelineTrackData[];
		readonly subscribe: (listener: () => void) => () => void;
	};
	readonly selection: {
		readonly getSnapshot: () => CanvasSelectionSnapshot;
		readonly subscribe: (listener: () => void) => () => void;
		readonly select: (
			item: CanvasSelectionItem,
			mode: CanvasSelectionMode,
		) => void;
		readonly setSelectedItems: (items: readonly CanvasSelectionItem[]) => void;
		readonly clear: () => void;
	};
};

type CanvasControllerInternals = {
	readonly setSequences: (sequences: TSequence[]) => void;
	readonly clear: () => void;
};

const controllerInternals = new WeakMap<
	CanvasController,
	CanvasControllerInternals
>();

export const createCanvasController = (): CanvasController => {
	let timelineSnapshot: readonly TimelineTrackData[] = [];
	let selectionSnapshot: CanvasSelectionSnapshot = {
		selectedItems: [],
		anchor: null,
	};
	const timelineListeners = new Set<() => void>();
	const selectionListeners = new Set<() => void>();

	const updateTimelineSnapshot = (
		nextSnapshot: readonly TimelineTrackData[],
	) => {
		timelineSnapshot = nextSnapshot;
		for (const listener of timelineListeners) {
			listener();
		}
	};

	const updateSelectionSnapshot = (
		selectedItems: readonly CanvasSelectionItem[],
		anchor: CanvasSelectionItem | null,
	) => {
		selectionSnapshot = {selectedItems, anchor};
		for (const listener of selectionListeners) {
			listener();
		}
	};

	const controller: CanvasController = {
		timeline: {
			getSnapshot: () => timelineSnapshot,
			subscribe: (listener) => {
				timelineListeners.add(listener);
				return () => timelineListeners.delete(listener);
			},
		},
		selection: {
			getSnapshot: () => selectionSnapshot,
			subscribe: (listener) => {
				selectionListeners.add(listener);
				return () => selectionListeners.delete(listener);
			},
			select: (item, mode) => {
				const itemKey = getCanvasSelectionItemKey(item);
				const selectedItemIndex = selectionSnapshot.selectedItems.findIndex(
					(selectedItem) => getCanvasSelectionItemKey(selectedItem) === itemKey,
				);

				if (mode === 'replace') {
					updateSelectionSnapshot([item], item);
					return;
				}

				if (mode === 'add') {
					if (selectedItemIndex === -1) {
						updateSelectionSnapshot(
							[...selectionSnapshot.selectedItems, item],
							item,
						);
					}

					return;
				}

				if (selectedItemIndex === -1) {
					updateSelectionSnapshot(
						[...selectionSnapshot.selectedItems, item],
						item,
					);
					return;
				}

				const nextSelectedItems = selectionSnapshot.selectedItems.filter(
					(_selectedItem, index) => index !== selectedItemIndex,
				);
				updateSelectionSnapshot(
					nextSelectedItems,
					nextSelectedItems.at(-1) ?? null,
				);
			},
			setSelectedItems: (items) => {
				const keys = new Set<string>();
				const selectedItems = items.filter((item) => {
					const key = getCanvasSelectionItemKey(item);
					if (keys.has(key)) {
						return false;
					}

					keys.add(key);
					return true;
				});
				updateSelectionSnapshot(selectedItems, selectedItems.at(-1) ?? null);
			},
			clear: () => updateSelectionSnapshot([], null),
		},
	};

	controllerInternals.set(controller, {
		setSequences: (sequences) => {
			updateTimelineSnapshot(
				calculateTimeline({
					sequences,
					overrideIdsToNodePaths: {},
				}),
			);
		},
		clear: () => updateTimelineSnapshot([]),
	});

	return controller;
};

export const useCanvasController = (): CanvasController => {
	const [controller] = useState(createCanvasController);
	return controller;
};

export const useCanvasSelection = (
	controller: CanvasController,
): CanvasSelectionSnapshot => {
	return useSyncExternalStore(
		controller.selection.subscribe,
		controller.selection.getSnapshot,
		controller.selection.getSnapshot,
	);
};

export const getCanvasControllerInternals = (
	controller: CanvasController,
): CanvasControllerInternals => {
	const internals = controllerInternals.get(controller);
	if (!internals) {
		throw new Error('Invalid Canvas controller');
	}

	return internals;
};
