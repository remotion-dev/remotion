import type {SequenceNodePath} from 'remotion';

export type PendingInsertedElementSelection = {
	compositionId: string;
	notification: string | null;
	nodePath: {
		absolutePath: string;
		nodePath: SequenceNodePath;
	} | null;
};

let pendingSelection: PendingInsertedElementSelection | null = null;
const listeners = new Set<() => void>();

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
