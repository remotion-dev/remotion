import {Internals} from 'remotion';

type UseSyncExternalStore = <TSnapshot>(
	subscribe: (onStoreChange: () => void) => () => void,
	getSnapshot: () => TSnapshot,
	getServerSnapshot?: () => TSnapshot,
) => TSnapshot;

export const {
	useSyncExternalStore,
}: typeof Internals & {
	useSyncExternalStore: UseSyncExternalStore;
} = Internals as typeof Internals & {
	useSyncExternalStore: UseSyncExternalStore;
};
