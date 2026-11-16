import React, {useCallback, useContext, useState} from 'react';
import type {RuntimeValueStore} from '../runtime-value-store.js';
import {useSyncExternalStore} from '../use-sync-external-store.js';
import type {EffectDescriptor} from './effect-types.js';

type EffectPreview = {
	readonly runtimeValues: RuntimeValueStore;
	readonly effect: EffectDescriptor<unknown>;
};

type EffectPreviewStore = {
	readonly setPreview: (preview: EffectPreview | null) => void;
	readonly subscribe: (
		runtimeValues: RuntimeValueStore | null,
		listener: () => void,
	) => () => void;
	readonly getSnapshot: (
		runtimeValues: RuntimeValueStore | null,
	) => EffectDescriptor<unknown> | null;
};

export const EffectPreviewContext = React.createContext<EffectPreviewStore>({
	setPreview: () => undefined,
	subscribe: () => () => undefined,
	getSnapshot: () => null,
});

export const EffectPreviewProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [store] = useState((): EffectPreviewStore => {
		let preview: EffectPreview | null = null;
		const listeners = new Map<RuntimeValueStore, Set<() => void>>();
		return {
			setPreview: (next) => {
				if (
					preview?.runtimeValues === next?.runtimeValues &&
					preview?.effect === next?.effect
				) {
					return;
				}

				const previousTarget = preview?.runtimeValues;
				preview = next;
				const targets = new Set([previousTarget, next?.runtimeValues]);
				for (const target of targets) {
					if (target === undefined) {
						continue;
					}

					for (const listener of listeners.get(target) ?? []) {
						listener();
					}
				}
			},
			subscribe: (runtimeValues, listener) => {
				if (runtimeValues === null) {
					return () => undefined;
				}

				let targetListeners = listeners.get(runtimeValues);
				if (targetListeners === undefined) {
					targetListeners = new Set();
					listeners.set(runtimeValues, targetListeners);
				}

				targetListeners.add(listener);
				return () => {
					targetListeners.delete(listener);
					if (targetListeners.size === 0) {
						listeners.delete(runtimeValues);
					}
				};
			},
			getSnapshot: (runtimeValues) =>
				preview?.runtimeValues === runtimeValues ? preview.effect : null,
		};
	});
	return (
		<EffectPreviewContext.Provider value={store}>
			{children}
		</EffectPreviewContext.Provider>
	);
};

export const useEffectPreview = (
	runtimeValues: RuntimeValueStore | null,
): EffectDescriptor<unknown> | null => {
	const store = useContext(EffectPreviewContext);
	const subscribe = useCallback(
		(listener: () => void) => store.subscribe(runtimeValues, listener),
		[runtimeValues, store],
	);
	const getSnapshot = useCallback(
		() => store.getSnapshot(runtimeValues),
		[runtimeValues, store],
	);
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
