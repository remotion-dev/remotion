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
import {
	remapCanvasSelection,
	remapOverrideIdToNodePaths,
	type CanvasSequenceNodePathRemapping,
} from './sequence-node-path-remapping';

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
	/**
	 * Queue the `nodePathRemappings` of a source edit. They are applied when
	 * the next Fast Refresh update starts, immediately before React commits the
	 * refreshed tree, so registered node paths and the selection never pair the
	 * new elements with the old paths.
	 */
	readonly queueSequenceNodePathRemappings: (
		remappings: readonly CanvasSequenceNodePathRemapping[],
	) => void;
	/**
	 * Apply the remappings of one source edit to the registered node paths and
	 * the selection right away, for hosts that swap the mounted tree themselves.
	 */
	readonly remapSequenceNodePaths: (
		remappings: readonly CanvasSequenceNodePathRemapping[],
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
	readonly commitQueuedSequenceNodePathRemappings: () => void;
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
				Internals.makeSequencePropsSubscriptionKey(nextNodePath)
		);
	});
};

export const createCanvasController = (): CanvasController => {
	let timelineSnapshot: readonly TimelineTrackData[] = [];
	let sequences: TSequence[] = [];
	let nodePaths: OverrideIdToNodePaths = {};
	let visualModeSetters: VisualModeSetters | null = null;
	// One entry per source edit: the remappings of an edit must not be chained
	// with each other, only with those of earlier edits.
	let queuedRemappings: (readonly CanvasSequenceNodePathRemapping[])[] = [];
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

	const setNodePaths = (nextNodePaths: OverrideIdToNodePaths) => {
		nodePaths = nextNodePaths;
		for (const listener of nodePathListeners) {
			listener();
		}

		recalculateTimeline();
	};

	const selection = createCanvasSelectionController();
	const hover = createCanvasHoverController();
	const remapSequenceNodePaths = (
		remappings: readonly CanvasSequenceNodePathRemapping[],
	) => {
		if (remappings.length === 0) {
			return;
		}

		const nextNodePaths = remapOverrideIdToNodePaths(nodePaths, remappings);
		if (nextNodePaths !== null) {
			setNodePaths(nextNodePaths);
		}

		const nextSelection = remapCanvasSelection(
			selection.getSnapshot(),
			remappings,
		);
		if (nextSelection !== null) {
			selection.setSnapshot(nextSelection);
		}

		// Hover keys embed node paths; the pointer restores it on the next move.
		hover.clear(null);
	};

	const controller: CanvasController = {
		timeline: {
			getSnapshot: () => timelineSnapshot,
			subscribe: (listener) => {
				timelineListeners.add(listener);
				return () => timelineListeners.delete(listener);
			},
		},
		selection,
		hover,
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

			setNodePaths({...nextNodePaths});
		},
		queueSequenceNodePathRemappings: (remappings) => {
			if (remappings.length > 0) {
				queuedRemappings.push(remappings);
			}
		},
		remapSequenceNodePaths,
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
		commitQueuedSequenceNodePathRemappings: () => {
			const pending = queuedRemappings;
			queuedRemappings = [];
			for (const remappings of pending) {
				remapSequenceNodePaths(remappings);
			}
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
