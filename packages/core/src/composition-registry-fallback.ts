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

export const CompositionRegistryFallbackContext = createContext<{
	readonly entries: Map<object, CommittedCompositionEntry>;
	readonly notifyCommit: () => void;
} | null>(null);

const useIsomorphicLayoutEffect =
	typeof window === 'undefined' ? useEffect : useLayoutEffect;

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
	useIsomorphicLayoutEffect(() => {
		if (registry === null) {
			return;
		}

		const identity = key.current;
		return () => {
			registry.entries.delete(identity);
			registry.notifyCommit();
		};
	}, [registry]);
};
