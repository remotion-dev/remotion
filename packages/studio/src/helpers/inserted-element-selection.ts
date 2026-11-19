import type {SequenceNodePath} from 'remotion';

export type InsertedElementSelectionBaseline = {
	fastRefreshes: number;
	existingSequenceIds: Set<string>;
};

export type PendingInsertedElementSelection = {
	compositionId: string;
	notification: string | null;
	nodePath: {
		absolutePath: string;
		nodePath: SequenceNodePath;
	} | null;
	// Timeline state from before the source mutation was sent. Fast Refresh may
	// commit the inserted sequence before the API response arrives.
	baseline: InsertedElementSelectionBaseline | null;
};

let pendingSelection: PendingInsertedElementSelection | null = null;
const listeners = new Set<() => void>();
let getBaseline: (() => InsertedElementSelectionBaseline) | null = null;

export const setInsertedElementSelectionBaselineGetter = (
	getter: (() => InsertedElementSelectionBaseline) | null,
) => {
	getBaseline = getter;
};

export const captureInsertedElementSelectionBaseline = () =>
	getBaseline?.() ?? null;

export const requestInsertedElementSelection = (
	selection: PendingInsertedElementSelection,
) => {
	pendingSelection = selection;
	for (const listener of listeners) {
		listener();
	}
};

export const clearInsertedElementSelection = (
	selection: PendingInsertedElementSelection,
) => {
	if (pendingSelection !== selection) {
		return;
	}

	pendingSelection = null;
	for (const listener of listeners) {
		listener();
	}
};

export const subscribeToInsertedElementSelection = (listener: () => void) => {
	listeners.add(listener);
	return () => listeners.delete(listener);
};

export const getInsertedElementSelection = () => pendingSelection;
