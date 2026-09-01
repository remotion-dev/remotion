import {useState} from 'react';
import type {TSequence} from 'remotion';
import {calculateTimeline} from './calculate-timeline';
import type {TimelineTrackData} from './get-timeline-sequence-sort-key';
import {
	createCanvasSelectionController,
	type CanvasSelectionController,
} from './selection';

export type CanvasController = {
	readonly timeline: {
		readonly getSnapshot: () => readonly TimelineTrackData[];
		readonly subscribe: (listener: () => void) => () => void;
	};
	readonly selection: CanvasSelectionController;
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
	const timelineListeners = new Set<() => void>();

	const updateTimelineSnapshot = (
		nextSnapshot: readonly TimelineTrackData[],
	) => {
		timelineSnapshot = nextSnapshot;
		for (const listener of timelineListeners) {
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
		selection: createCanvasSelectionController(),
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

export const getCanvasControllerInternals = (
	controller: CanvasController,
): CanvasControllerInternals => {
	const internals = controllerInternals.get(controller);
	if (!internals) {
		throw new Error('Invalid Canvas controller');
	}

	return internals;
};
