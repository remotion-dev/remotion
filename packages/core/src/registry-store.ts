export type RegistryStore<TSnapshot> = {
	readonly getSnapshot: () => TSnapshot;
	readonly subscribe: (listener: () => void) => () => void;
	readonly setSnapshot: (update: (previous: TSnapshot) => TSnapshot) => void;
};

export const areRegistryEntriesEqual = <T extends object>(
	previous: T,
	next: T,
) => {
	const keys = Object.keys(previous);
	return (
		keys.length === Object.keys(next).length &&
		keys.every(
			(key) =>
				Object.prototype.hasOwnProperty.call(next, key) &&
				Object.is(Reflect.get(previous, key), Reflect.get(next, key)),
		)
	);
};

export const reconcileRegistryEntries = <T extends object>({
	current,
	entries,
	previousDescriptors,
	previousKeys,
	nextKeys,
	getKey,
	order,
	orderProperty,
}: {
	readonly current: T[];
	readonly entries: readonly T[];
	readonly previousDescriptors: ReadonlyMap<string, unknown>;
	readonly previousKeys: ReadonlySet<string>;
	readonly nextKeys: ReadonlySet<string>;
	readonly getKey: (entry: T) => string;
	readonly order: ReadonlyMap<string, number>;
	readonly orderProperty: keyof T;
}): T[] => {
	const previousByKey = new Map(current.map((entry) => [getKey(entry), entry]));
	const next = entries.map((entry) => {
		const key = getKey(entry);
		const previous = previousByKey.get(key);
		const nextOrder = order.get(key) ?? null;
		if (
			previous &&
			previousDescriptors.get(key) === entry &&
			previous[orderProperty] === nextOrder
		) {
			return previous;
		}

		const registered = {...entry, [orderProperty]: nextOrder};
		return previous && areRegistryEntriesEqual(previous, registered)
			? previous
			: registered;
	});
	// Preserve imperative registrations, including their committed order.
	for (const entry of current) {
		const key = getKey(entry);
		if (!previousKeys.has(key) && !nextKeys.has(key)) {
			const nextOrder = order.get(key) ?? entry[orderProperty];
			next.push(
				entry[orderProperty] === nextOrder
					? entry
					: {...entry, [orderProperty]: nextOrder},
			);
		}
	}

	return next.length === current.length &&
		next.every((entry, index) => entry === current[index])
		? current
		: next;
};

export const createRegistryStore = <TSnapshot>(
	initialSnapshot: TSnapshot,
): RegistryStore<TSnapshot> => {
	let snapshot = initialSnapshot;
	const listeners = new Set<() => void>();
	return {
		getSnapshot: () => snapshot,
		subscribe: (listener) => {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
		setSnapshot: (update) => {
			const next = update(snapshot);
			if (next === snapshot) {
				return;
			}

			snapshot = next;
			for (const listener of [...listeners]) {
				listener();
			}
		},
	};
};
