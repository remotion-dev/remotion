import type React from 'react';
import {useState} from 'react';
import type {
	DragOverrideValue,
	OverrideIdToNodePaths,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import {calculateTimeline} from './calculate-timeline';
import type {
	SequenceNodePathInfo,
	TimelineTrackData,
} from './get-timeline-sequence-sort-key';
import {createCanvasHoverController, type CanvasHoverController} from './hover';
import {
	createCanvasSelectionController,
	type CanvasSelectionController,
} from './selection';

type VisualModeSetters = React.ContextType<
	typeof Internals.VisualModeSettersContext
>;

export type CanvasOverridesController = {
	/** Preview a prop value on the mounted sequence without changing the source. */
	readonly set: (
		nodePathInfo: SequenceNodePathInfo,
		key: string,
		value: DragOverrideValue,
	) => void;
	/** Remove every override of the sequence. */
	readonly clear: (nodePathInfo: SequenceNodePathInfo) => void;
};

export type CanvasController = {
	readonly timeline: {
		readonly getSnapshot: () => readonly TimelineTrackData[];
		readonly subscribe: (listener: () => void) => () => void;
	};
	readonly selection: CanvasSelectionController;
	readonly hover: CanvasHoverController;
	readonly overrides: CanvasOverridesController;
	/**
	 * Map `track.sequence.controls.overrideId` values to the source nodes the
	 * sequences were mounted from. Populates `nodePathInfo` on the timeline.
	 */
	readonly setSequenceNodePaths: (
		nodePaths: Record<string, SequencePropsSubscriptionKey>,
	) => void;
};

type CanvasControllerInternals = {
	readonly setSequences: (sequences: TSequence[]) => void;
	readonly clear: () => void;
	readonly nodePaths: {
		readonly getSnapshot: () => OverrideIdToNodePaths;
		readonly subscribe: (listener: () => void) => () => void;
	};
	readonly setVisualModeSetters: (setters: VisualModeSetters | null) => void;
};

const controllerInternals = new WeakMap<
	CanvasController,
	CanvasControllerInternals
>();

const nodePathsAreEqual = (
	previous: OverrideIdToNodePaths,
	next: OverrideIdToNodePaths,
): boolean => {
	const previousIds = Object.keys(previous);
	if (previousIds.length !== Object.keys(next).length) {
		return false;
	}

	return previousIds.every((overrideId) => {
		const previousNodePath = previous[overrideId];
		const nextNodePath = next[overrideId];
		return (
			nextNodePath !== undefined &&
			Internals.makeSequencePropsSubscriptionKey(previousNodePath) ===
				Internals.makeSequencePropsSubscriptionKey(nextNodePath) &&
			JSON.stringify(previousNodePath.videoConfigValues) ===
				JSON.stringify(nextNodePath.videoConfigValues)
		);
	});
};

export const createCanvasController = (): CanvasController => {
	let timelineSnapshot: readonly TimelineTrackData[] = [];
	let sequences: TSequence[] = [];
	let nodePaths: OverrideIdToNodePaths = {};
	let visualModeSetters: VisualModeSetters | null = null;
	const timelineListeners = new Set<() => void>();
	const nodePathListeners = new Set<() => void>();

	const updateTimelineSnapshot = (
		nextSnapshot: readonly TimelineTrackData[],
	) => {
		timelineSnapshot = nextSnapshot;
		for (const listener of timelineListeners) {
			listener();
		}
	};

	const recalculateTimeline = () => {
		updateTimelineSnapshot(
			calculateTimeline({
				sequences,
				overrideIdsToNodePaths: nodePaths,
			}),
		);
	};

	const controller: CanvasController = {
		timeline: {
			getSnapshot: () => timelineSnapshot,
			subscribe: (listener) => {
				timelineListeners.add(listener);
				return () => timelineListeners.delete(listener);
			},
		},
		selection: createCanvasSelectionController(),
		hover: createCanvasHoverController(),
		overrides: {
			set: (nodePathInfo, key, value) => {
				visualModeSetters?.setDragOverrides(
					nodePathInfo.sequenceSubscriptionKey,
					key,
					value,
				);
			},
			clear: (nodePathInfo) => {
				visualModeSetters?.clearDragOverrides(
					nodePathInfo.sequenceSubscriptionKey,
				);
			},
		},
		setSequenceNodePaths: (nextNodePaths) => {
			if (nodePathsAreEqual(nodePaths, nextNodePaths)) {
				return;
			}

			nodePaths = {...nextNodePaths};
			for (const listener of nodePathListeners) {
				listener();
			}

			recalculateTimeline();
		},
	};

	controllerInternals.set(controller, {
		setSequences: (nextSequences) => {
			sequences = nextSequences;
			recalculateTimeline();
		},
		clear: () => {
			sequences = [];
			updateTimelineSnapshot([]);
			controller.hover.clear(null);
		},
		nodePaths: {
			getSnapshot: () => nodePaths,
			subscribe: (listener) => {
				nodePathListeners.add(listener);
				return () => nodePathListeners.delete(listener);
			},
		},
		setVisualModeSetters: (setters) => {
			visualModeSetters = setters;
		},
	});

	return controller;
};

export const useCanvasController = (): CanvasController => {
	const [controller] = useState(createCanvasController);
	return controller;
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
