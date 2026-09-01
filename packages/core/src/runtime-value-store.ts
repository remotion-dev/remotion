export type RuntimeValueSnapshot = Readonly<Record<string, unknown>>;

export type RuntimeValueStore<
	TSnapshot extends RuntimeValueSnapshot = RuntimeValueSnapshot,
> = {
	getSnapshot: () => TSnapshot;
	subscribe: (listener: (snapshot: TSnapshot) => void) => () => void;
};

export type RuntimeValueStoreController<
	TSnapshot extends RuntimeValueSnapshot = RuntimeValueSnapshot,
> = {
	store: RuntimeValueStore<TSnapshot>;
	setSnapshot: (newSnapshot: TSnapshot) => void;
};

export const createRuntimeValueStore = <TSnapshot extends RuntimeValueSnapshot>(
	initialSnapshot: TSnapshot,
): RuntimeValueStoreController<TSnapshot> => {
	let snapshot = initialSnapshot;
	const listeners = new Set<(snapshot: TSnapshot) => void>();

	const store: RuntimeValueStore<TSnapshot> = {
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
				listener(snapshot);
			}
		},
	};
};
