import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	COMMIT_REGISTRATION_ERROR_EVENT,
	getCompositionAndFolderOrderKey,
	getFolderOrderId,
	isCommitRegistrationObserverInstalled,
	withCommittedMetadata,
	type CommittedMetadata,
	type CommittedCompositionSnapshot,
} from './committed-metadata.js';
import {
	CompositionRegistryFallbackContext,
	type CommittedCompositionEntry,
} from './composition-registry-fallback.js';
import type {AnyComposition} from './CompositionManager.js';
import type {TFolder} from './Folder.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';

const useIsomorphicLayoutEffect =
	typeof window === 'undefined' ? useEffect : useLayoutEffect;
const CompositionRegistryFallbackProvider = withCommittedMetadata(
	CompositionRegistryFallbackContext.Provider,
);

// Every consumer receives a complete committed snapshot. The fallback changes
// how descriptors are captured, rather than exposing a second registration API.
export const CompositionRegistryProvider = forwardRef<
	() => void,
	{
		readonly children: React.ReactNode;
		readonly onSnapshot: (snapshot: CommittedCompositionSnapshot) => void;
	}
>(({children, onSnapshot}, flushSnapshotRef) => {
	const {isStudio} = useRemotionEnvironment();
	const [managerId] = useState(() => String(Math.random()));
	const [useCommitObserver, setUseCommitObserver] = useState(
		() => isStudio && isCommitRegistrationObserverInstalled(),
	);
	const observedCommitRef = useRef(false);
	const observerFailedRef = useRef(false);
	const unmountedRef = useRef(false);
	const onSnapshotRef = useRef(onSnapshot);
	const lastSnapshotRef = useRef<CommittedCompositionSnapshot | null>(null);
	const pendingSnapshotRef = useRef<
		CommittedCompositionSnapshot | (() => CommittedCompositionSnapshot) | null
	>(null);
	const flushSnapshot = useCallback(() => {
		const pending = pendingSnapshotRef.current;
		pendingSnapshotRef.current = null;
		if (pending === null || unmountedRef.current) {
			return;
		}

		const committed = typeof pending === 'function' ? pending() : pending;
		const previous = lastSnapshotRef.current;
		if (
			previous !== null &&
			(previous.compositions === committed.compositions ||
				(previous.compositions.length === committed.compositions.length &&
					previous.compositions.every(
						(composition, index) =>
							composition === committed.compositions[index],
					))) &&
			(previous.folders === committed.folders ||
				(previous.folders.length === committed.folders.length &&
					previous.folders.every(
						(folder, index) => folder === committed.folders[index],
					))) &&
			(previous.orderIds === committed.orderIds ||
				(previous.orderIds.length === committed.orderIds.length &&
					previous.orderIds.every(
						(id, index) => id === committed.orderIds[index],
					)))
		) {
			return;
		}

		lastSnapshotRef.current = committed;
		onSnapshotRef.current(committed);
	}, []);
	useImperativeHandle(flushSnapshotRef, () => flushSnapshot, [flushSnapshot]);
	const queueSnapshot = useCallback(
		(
			snapshot:
				| CommittedCompositionSnapshot
				| (() => CommittedCompositionSnapshot),
		) => {
			const alreadyPending = pendingSnapshotRef.current !== null;
			pendingSnapshotRef.current = snapshot;
			if (alreadyPending) {
				return;
			}

			queueMicrotask(flushSnapshot);
		},
		[flushSnapshot],
	);
	const onObservedSnapshot = useCallback(
		(snapshot: CommittedCompositionSnapshot) => {
			if (observerFailedRef.current) {
				return;
			}

			observedCommitRef.current = true;
			queueSnapshot(snapshot);
		},
		[queueSnapshot],
	);
	const fallbackRegistry = useMemo(() => {
		const entries = new Map<object, CommittedCompositionEntry>();
		const getSnapshot = (): CommittedCompositionSnapshot => {
			const compositions: AnyComposition[] = [];
			const folders: TFolder[] = [];
			const orderIds: string[] = [];
			for (const entry of entries.values()) {
				if (entry.type === 'composition') {
					compositions.push(entry.value);
					orderIds.push(
						getCompositionAndFolderOrderKey({
							type: 'composition',
							id: entry.value.id,
						}),
					);
				} else {
					folders.push(entry.value);
					orderIds.push(
						getCompositionAndFolderOrderKey({
							type: 'folder',
							id: getFolderOrderId(entry.value),
						}),
					);
				}
			}

			return {compositions, folders, orderIds};
		};

		return {entries, notifyCommit: () => queueSnapshot(getSnapshot)};
	}, [queueSnapshot]);
	useIsomorphicLayoutEffect(() => {
		if (onSnapshotRef.current !== onSnapshot) {
			const previous = lastSnapshotRef.current;
			lastSnapshotRef.current = null;
			if (useCommitObserver && previous !== null) {
				queueSnapshot(previous);
			}
		}

		onSnapshotRef.current = onSnapshot;
		if (!useCommitObserver) {
			fallbackRegistry.notifyCommit();
		}
	}, [fallbackRegistry, onSnapshot, queueSnapshot, useCommitObserver]);
	useIsomorphicLayoutEffect(() => {
		unmountedRef.current = false;
		let unmounted = false;
		const onRegistrationError = () => {
			if (observerFailedRef.current) {
				return;
			}

			observerFailedRef.current = true;
			pendingSnapshotRef.current = null;
			queueMicrotask(() => {
				if (!unmountedRef.current) {
					setUseCommitObserver(false);
				}
			});
		};

		if (isStudio) {
			window.addEventListener(
				COMMIT_REGISTRATION_ERROR_EVENT,
				onRegistrationError,
			);
			if (useCommitObserver) {
				queueMicrotask(() => {
					if (!unmounted && !observedCommitRef.current) {
						onRegistrationError();
					}
				});
			}
		}

		return () => {
			unmounted = true;
			unmountedRef.current = true;
			if (isStudio) {
				window.removeEventListener(
					COMMIT_REGISTRATION_ERROR_EVENT,
					onRegistrationError,
				);
			}
		};
	}, [isStudio, useCommitObserver]);
	const metadata = useMemo<CommittedMetadata | null>(
		() =>
			isStudio
				? {
						type: 'composition-manager',
						id: managerId,
						onCommit: useCommitObserver ? onObservedSnapshot : null,
					}
				: null,
		[isStudio, managerId, onObservedSnapshot, useCommitObserver],
	);
	return (
		<CompositionRegistryFallbackProvider
			value={useCommitObserver ? null : fallbackRegistry}
			_remotionCommitMetadata={metadata}
		>
			{children}
		</CompositionRegistryFallbackProvider>
	);
});
