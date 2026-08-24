import {useState} from 'react';
import type {TSequence} from 'remotion';
import {calculateTimeline} from './calculate-timeline';
import type {TimelineTrackData} from './get-timeline-sequence-sort-key';

export type CanvasController = {
	readonly timeline: {
		readonly getSnapshot: () => readonly TimelineTrackData[];
		readonly subscribe: (listener: () => void) => () => void;
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
	let snapshot: readonly TimelineTrackData[] = [];
	const listeners = new Set<() => void>();

	const updateSnapshot = (nextSnapshot: readonly TimelineTrackData[]) => {
		snapshot = nextSnapshot;
		for (const listener of listeners) {
			listener();
		}
	};

	const controller: CanvasController = {
		timeline: {
			getSnapshot: () => snapshot,
			subscribe: (listener) => {
				listeners.add(listener);
				return () => listeners.delete(listener);
			},
		},
	};

	controllerInternals.set(controller, {
		setSequences: (sequences) => {
			updateSnapshot(
				calculateTimeline({
					sequences,
					overrideIdsToNodePaths: {},
				}),
			);
		},
		clear: () => updateSnapshot([]),
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
