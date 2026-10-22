import {useMemo} from 'react';
import type {SequenceRegistrationControls} from 'remotion';
import {useSyncExternalStore} from './use-sync-external-store';

export const useCanvasRuntimeValueSnapshots = (
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
				let active = true;
				let scheduled = false;
				const onStoreChange = () => {
					if (scheduled) {
						return;
					}

					// Runtime values publish together in layout effects. Notify after the
					// commit so each layer does not make React reread every other layer.
					scheduled = true;
					queueMicrotask(() => {
						scheduled = false;
						if (active) {
							listener();
						}
					});
				};

				const unsubscribers = stores.map((store) =>
					store.subscribe(onStoreChange),
				);
				return () => {
					active = false;
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
