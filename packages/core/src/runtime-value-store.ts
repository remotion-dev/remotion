export type RuntimeValueSnapshot = Readonly<Record<string, unknown>>;

export type RuntimeValueStore = {
	getSnapshot: () => RuntimeValueSnapshot;
	subscribe: (listener: () => void) => () => void;
};

export type RuntimeValueStoreController = {
	store: RuntimeValueStore;
	setSnapshot: (newSnapshot: RuntimeValueSnapshot) => void;
};

export const createRuntimeValueStore = (
	initialSnapshot: RuntimeValueSnapshot,
): RuntimeValueStoreController => {
	let snapshot = initialSnapshot;
	const listeners = new Set<() => void>();

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

			snapshot = newSnapshot;
			for (const listener of listeners) {
				listener();
			}
		},
	};
};
