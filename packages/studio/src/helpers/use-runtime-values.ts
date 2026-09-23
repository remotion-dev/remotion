import {useCallback, useMemo} from 'react';
import {
	type RuntimeValueStore,
	type SequenceRegistrationControls,
} from 'remotion';
import {useSyncExternalStore} from './use-sync-external-store';

const EMPTY_RUNTIME_VALUES: Readonly<Record<string, unknown>> = {};
const EMPTY_RUNTIME_VALUE_STORE = {
	getSnapshot: () => EMPTY_RUNTIME_VALUES,
	subscribe: () => () => undefined,
};

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
	return useRuntimeStoreValue(controls?.runtimeValues ?? null, key);
};

export const useRuntimeStoreValue = (
	storeOrNull: RuntimeValueStore | null,
	key: string,
): unknown => {
	const store = storeOrNull ?? EMPTY_RUNTIME_VALUE_STORE;
	const getSnapshot = useCallback(() => store.getSnapshot()[key], [key, store]);

	return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
};

export const useRuntimeValueSelector = <T>({
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

export {useCanvasRuntimeValueSnapshots as useRuntimeValueSnapshots} from '@remotion/canvas/internal';
