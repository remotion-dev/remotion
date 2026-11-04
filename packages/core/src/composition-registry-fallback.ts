import {
	createContext,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
} from 'react';
import type {AnyComposition} from './CompositionManager.js';
import type {TFolder} from './Folder.js';

export type CommittedCompositionEntry =
	| {readonly type: 'composition'; readonly value: AnyComposition}
	| {readonly type: 'folder'; readonly value: TFolder};

type CompositionRegistryFallback = {
	readonly entries: Map<object, CommittedCompositionEntry>;
	readonly notifyCommit: () => void;
};

export const CompositionRegistryFallbackContext =
	createContext<CompositionRegistryFallback | null>(null);

const useIsomorphicLayoutEffect =
	typeof window === 'undefined' ? useEffect : useLayoutEffect;

const createEntryCleanup = (
	registry: CompositionRegistryFallback | null,
	identity: object,
) => {
	if (registry === null) {
		return;
	}

	return () => {
		registry.entries.delete(identity);
		registry.notifyCommit();
	};
};

// The fallback stages descriptors during layout effects and publishes one
// complete snapshot after the commit, including mount and unmount changes.
export const useCommittedCompositionEntry = (
	entry: CommittedCompositionEntry | null,
) => {
	const registry = useContext(CompositionRegistryFallbackContext);
	const key = useRef({});
	useIsomorphicLayoutEffect(() => {
		if (registry === null) {
			return;
		}

		if (entry === null) {
			registry.entries.delete(key.current);
		} else {
			registry.entries.set(key.current, entry);
		}

		registry.notifyCommit();
	}, [entry, registry]);
	// The cleanup outlives entry changes. Binding a separate factory prevents it
	// from sharing a closure with the original entry, even after minification.
	useIsomorphicLayoutEffect(
		createEntryCleanup.bind(null, registry, key.current),
		[registry],
	);
};
