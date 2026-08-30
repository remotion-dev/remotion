export type RuntimeValueSnapshot = Readonly<Record<string, unknown>>;

type RuntimeValueStoreListener = (
	newSnapshot: RuntimeValueSnapshot,
	oldSnapshot: RuntimeValueSnapshot,
) => void;

export type RuntimeValueStore = {
	getSnapshot: () => RuntimeValueSnapshot;
	subscribe: (listener: RuntimeValueStoreListener) => () => void;
};

export type RuntimeValueStoreController = {
	store: RuntimeValueStore;
	setSnapshot: (newSnapshot: RuntimeValueSnapshot) => void;
};

export const createRuntimeValueStore = (
	initialSnapshot: RuntimeValueSnapshot,
	initialSubscribers: RuntimeValueStoreListener[] = [],
): RuntimeValueStoreController => {
	let snapshot = initialSnapshot;
	const listeners = new Set<RuntimeValueStoreListener>(initialSubscribers);

	const store: RuntimeValueStore = {
		getSnapshot: () => snapshot,
		subscribe: (listener) => {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
	};

	return {
		store,
		setSnapshot: (newSnapshot) => {
			if (snapshot === newSnapshot) {
				return;
			}

			const oldSnapshot = snapshot;
			snapshot = newSnapshot;
			for (const listener of listeners) {
				listener(newSnapshot, oldSnapshot);
			}
		},
	};
};
