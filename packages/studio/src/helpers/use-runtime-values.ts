import {useCallback, useMemo, useSyncExternalStore} from 'react';
import type {SequenceRegistrationControls} from 'remotion';

const EMPTY_RUNTIME_VALUES: Readonly<Record<string, unknown>> = {};
const EMPTY_RUNTIME_VALUE_STORE = {
	getSnapshot: () => EMPTY_RUNTIME_VALUES,
	subscribe: () => () => undefined,
};

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
	const store = controls?.runtimeValues ?? EMPTY_RUNTIME_VALUE_STORE;
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
	const store = controls?.runtimeValues ?? EMPTY_RUNTIME_VALUE_STORE;
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
	const store = controls?.runtimeValues ?? EMPTY_RUNTIME_VALUE_STORE;
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
		() => controls.map((control) => control.runtimeValues),
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
