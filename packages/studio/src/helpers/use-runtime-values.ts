import {useCallback, useMemo, useSyncExternalStore} from 'react';
import type {RuntimeValueStore, SequenceRegistrationControls} from 'remotion';

const EMPTY_RUNTIME_VALUES: Readonly<Record<string, unknown>> = {};
const EMPTY_RUNTIME_VALUE_STORE = {
	getSnapshot: () => EMPTY_RUNTIME_VALUES,
	subscribe: () => () => undefined,
};
const LEGACY_RUNTIME_VALUE_STORES = new WeakMap<
	SequenceRegistrationControls,
	RuntimeValueStore
>();

type LegacySequenceRegistrationControls = SequenceRegistrationControls & {
	currentRuntimeValueDotNotation?: Readonly<Record<string, unknown>>;
};

export const getRuntimeValueStore = (
	controls: SequenceRegistrationControls | null,
): RuntimeValueStore => {
	if (!controls) {
		return EMPTY_RUNTIME_VALUE_STORE;
	}

	if (controls.runtimeValues) {
		return controls.runtimeValues;
	}

	const existing = LEGACY_RUNTIME_VALUE_STORES.get(controls);
	if (existing) {
		return existing;
	}

	const legacyControls = controls as LegacySequenceRegistrationControls;
	const legacyStore: RuntimeValueStore = {
		getSnapshot: () =>
			legacyControls.currentRuntimeValueDotNotation ?? EMPTY_RUNTIME_VALUES,
		subscribe: EMPTY_RUNTIME_VALUE_STORE.subscribe,
	};
	LEGACY_RUNTIME_VALUE_STORES.set(controls, legacyStore);
	return legacyStore;
};

export const getRuntimeValueSnapshot = (
	controls: SequenceRegistrationControls | null,
): Readonly<Record<string, unknown>> =>
	getRuntimeValueStore(controls).getSnapshot();

type RuntimeValueSelectorResult =
	| string
	| number
	| boolean
	| bigint
	| symbol
	| null
	| undefined;

export const useRuntimeValues = (
	controls: SequenceRegistrationControls | null,
): Readonly<Record<string, unknown>> => {
	const store = getRuntimeValueStore(controls);
	return useSyncExternalStore(
		store.subscribe,
		store.getSnapshot,
		store.getSnapshot,
	);
};

export const useRuntimeValue = (
	controls: SequenceRegistrationControls | null,
	key: string,
): unknown => {
	const store = getRuntimeValueStore(controls);
	const getSnapshot = useCallback(() => store.getSnapshot()[key], [key, store]);

	return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
};

export const useRuntimeValueSelector = <T extends RuntimeValueSelectorResult>({
	controls,
	selector,
	isEqual = Object.is,
}: {
	controls: SequenceRegistrationControls | null;
	selector: (values: Readonly<Record<string, unknown>>) => T;
	isEqual?: (first: T, second: T) => boolean;
}): T => {
	const store = getRuntimeValueStore(controls);
	const selectedStore = useMemo(() => {
		let lastSource = store.getSnapshot();
		let lastSelection = selector(lastSource);

		const getSnapshot = () => {
			const nextSource = store.getSnapshot();
			if (nextSource === lastSource) {
				return lastSelection;
			}

			lastSource = nextSource;
			const nextSelection = selector(nextSource);
			if (!isEqual(lastSelection, nextSelection)) {
				lastSelection = nextSelection;
			}

			return lastSelection;
		};

		return {
			getSnapshot,
			subscribe: store.subscribe,
		};
	}, [isEqual, selector, store]);

	return useSyncExternalStore(
		selectedStore.subscribe,
		selectedStore.getSnapshot,
		selectedStore.getSnapshot,
	);
};

export const useRuntimeValueSnapshots = (
	controls: readonly SequenceRegistrationControls[],
): readonly Readonly<Record<string, unknown>>[] => {
	const stores = useMemo(
		() => controls.map((control) => getRuntimeValueStore(control)),
		[controls],
	);
	const aggregateStore = useMemo(() => {
		let lastSnapshots = stores.map((store) => store.getSnapshot());
		const getSnapshot = () => {
			const nextSnapshots = stores.map((store) => store.getSnapshot());
			if (
				nextSnapshots.length === lastSnapshots.length &&
				nextSnapshots.every(
					(snapshot, index) => snapshot === lastSnapshots[index],
				)
			) {
				return lastSnapshots;
			}

			lastSnapshots = nextSnapshots;
			return lastSnapshots;
		};

		return {
			getSnapshot,
			subscribe: (listener: () => void) => {
				const unsubscribers = stores.map((store) => store.subscribe(listener));
				return () => {
					for (const unsubscribe of unsubscribers) {
						unsubscribe();
					}
				};
			},
		};
	}, [stores]);

	return useSyncExternalStore(
		aggregateStore.subscribe,
		aggregateStore.getSnapshot,
		aggregateStore.getSnapshot,
	);
};
