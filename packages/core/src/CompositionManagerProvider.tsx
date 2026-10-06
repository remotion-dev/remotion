import {
	useCallback,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {AnyZodObject} from './any-zod-type.js';
import type {TComposition} from './CompositionManager';
import {compositionsRef, type AnyComposition} from './CompositionManager';
import type {
	AssetPreviewMetadata,
	CanvasContent,
	CompositionManagerContext,
	CompositionManagerSetters,
} from './CompositionManagerContext';
import {
	CompositionManager,
	CompositionCommitRegistrationContext,
	CompositionSetters,
} from './CompositionManagerContext';
import type {BaseMetadata} from './CompositionManagerContext.js';
import type {TFolder} from './Folder';
import {
	createRegistryStore,
	reconcileRegistryEntries,
} from './registry-store.js';
import {
	COMMIT_REGISTRATION_ERROR_EVENT,
	CompositionManagerOrderMarker,
	getCompositionAndFolderOrderKey,
	getFolderOrderId,
	isCommitRegistrationObserverAvailable,
	COMMIT_ORDER_EVENT,
	type CommitOrderEventDetail,
	type CommittedCompositionSnapshot,
} from './sequence-order-marker.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
import {useSyncExternalStore} from './use-sync-external-store.js';

const useIsomorphicLayoutEffect =
	typeof window === 'undefined' ? useEffect : useLayoutEffect;

export const CompositionManagerProvider = ({
	children,
	onlyRenderComposition,
	currentCompositionMetadata,
	initialCompositions,
	initialCanvasContent,
}: {
	readonly children: React.ReactNode;
	readonly onlyRenderComposition: string | null;
	readonly currentCompositionMetadata: BaseMetadata | null;
	readonly initialCompositions: AnyComposition[];
	readonly initialCanvasContent: CanvasContent | null;
}) => {
	const {isStudio} = useRemotionEnvironment();
	const [compositionManagerId] = useState(() => String(Math.random()));
	const [commitRegistrationEnabled, setCommitRegistrationEnabled] = useState(
		() => isStudio && isCommitRegistrationObserverAvailable(),
	);
	const pendingRegistrationsRef = useRef<CommittedCompositionSnapshot | null>(
		null,
	);
	const lastRegistrationsRef = useRef<CommittedCompositionSnapshot | null>(
		null,
	);
	const committedKeysRef = useRef<ReadonlySet<string>>(new Set());
	const committedDescriptorsRef = useRef<
		ReadonlyMap<string, AnyComposition | TFolder>
	>(new Map());
	const observerFailedRef = useRef(false);
	const unmountedRef = useRef(false);
	const [registrationError, setRegistrationError] = useState<Error | null>(
		null,
	);
	const committedOrderRef = useRef<ReadonlyMap<string, number> | null>(null);
	const committedOrderIdsRef = useRef<readonly string[] | null>(null);
	const internalOrderRef = useRef(
		new Map(
			initialCompositions.map((composition, index) => [
				getCompositionAndFolderOrderKey({
					type: 'composition',
					id: composition.id,
				}),
				index,
			]),
		),
	);
	const nextInternalOrderRef = useRef(initialCompositions.length);
	const [registry] = useState(() =>
		createRegistryStore<{
			compositions: AnyComposition[];
			folders: TFolder[];
		}>({
			compositions: initialCompositions.map((composition, order) => ({
				...composition,
				order,
			})),
			folders: [],
		}),
	);
	const {compositions, folders} = useSyncExternalStore(
		registry.subscribe,
		registry.getSnapshot,
		registry.getSnapshot,
	);
	const [canvasContent, setCanvasContent] = useState<CanvasContent | null>(
		initialCanvasContent,
	);
	const [currentAssetMetadata, setCurrentAssetMetadata] =
		useState<AssetPreviewMetadata | null>(null);
	const updateCompositions = useCallback(
		(updateComps: (comp: AnyComposition[]) => AnyComposition[]) => {
			registry.setSnapshot((previous) => {
				const next = updateComps(previous.compositions);
				return next === previous.compositions
					? previous
					: {...previous, compositions: next};
			});
		},
		[registry],
	);
	const setFolders = useCallback(
		(update: (folders: TFolder[]) => TFolder[]) => {
			registry.setSnapshot((previous) => {
				const next = update(previous.folders);
				return next === previous.folders
					? previous
					: {...previous, folders: next};
			});
		},
		[registry],
	);

	const registerComposition = useCallback(
		<Schema extends AnyZodObject, Props extends Record<string, unknown>>(
			comp: TComposition<Schema, Props>,
		) => {
			const orderKey = getCompositionAndFolderOrderKey({
				type: 'composition',
				id: comp.id,
			});
			const internalOrder = nextInternalOrderRef.current++;
			internalOrderRef.current.set(orderKey, internalOrder);
			updateCompositions((comps) => {
				if (comps.find((c) => c.id === comp.id)) {
					throw new Error(
						`Multiple composition with id ${comp.id} are registered.`,
					);
				}

				return [
					...comps,
					{
						...comp,
						order: committedOrderRef.current?.get(orderKey) ?? internalOrder,
					},
				] as AnyComposition[];
			});
		},
		[updateCompositions],
	);

	const unregisterComposition = useCallback(
		(id: string) => {
			internalOrderRef.current.delete(
				getCompositionAndFolderOrderKey({type: 'composition', id}),
			);
			updateCompositions((comps) => {
				return comps.filter((c) => c.id !== id);
			});
		},
		[updateCompositions],
	);

	const registerFolder = useCallback(
		(name: string, parent: string | null, stack: string | null) => {
			const orderKey = getCompositionAndFolderOrderKey({
				type: 'folder',
				id: getFolderOrderId({name, parent}),
			});
			const internalOrder = nextInternalOrderRef.current++;
			internalOrderRef.current.set(orderKey, internalOrder);
			setFolders((prevFolders) => {
				return [
					...prevFolders,
					{
						name,
						parent,
						order: committedOrderRef.current?.get(orderKey) ?? internalOrder,
						stack,
					},
				];
			});
		},
		[setFolders],
	);

	const unregisterFolder = useCallback(
		(name: string, parent: string | null) => {
			internalOrderRef.current.delete(
				getCompositionAndFolderOrderKey({
					type: 'folder',
					id: getFolderOrderId({name, parent}),
				}),
			);
			setFolders((prevFolders) => {
				return prevFolders.filter(
					(p) => !(p.name === name && p.parent === parent),
				);
			});
		},
		[setFolders],
	);

	const onCommitRegistrations = useCallback(
		(snapshot: CommittedCompositionSnapshot) => {
			if (observerFailedRef.current || unmountedRef.current) {
				return;
			}

			const previous =
				pendingRegistrationsRef.current ?? lastRegistrationsRef.current;
			if (
				previous?.compositions === snapshot.compositions &&
				previous.folders === snapshot.folders &&
				previous.orderIds === snapshot.orderIds
			) {
				return;
			}

			const alreadyPending = pendingRegistrationsRef.current !== null;
			pendingRegistrationsRef.current = snapshot;
			if (alreadyPending) {
				return;
			}

			queueMicrotask(() => {
				const pending = pendingRegistrationsRef.current;
				pendingRegistrationsRef.current = null;
				if (
					pending === null ||
					observerFailedRef.current ||
					unmountedRef.current
				) {
					return;
				}

				const previousKeys = committedKeysRef.current;
				const previousDescriptors = committedDescriptorsRef.current;
				const existingIds = new Set(
					registry
						.getSnapshot()
						.compositions.map((composition) => composition.id),
				);
				const descriptors = new Map<string, AnyComposition | TFolder>();
				for (const composition of pending.compositions) {
					const key = `composition:${composition.id}`;
					if (
						descriptors.has(key) ||
						(!previousKeys.has(key) && existingIds.has(composition.id))
					) {
						setRegistrationError(
							new Error(
								`Multiple composition with id ${composition.id} are registered.`,
							),
						);
						return;
					}

					descriptors.set(key, composition);
				}

				for (const folder of pending.folders) {
					descriptors.set(`folder:${getFolderOrderId(folder)}`, folder);
				}

				const nextKeys = new Set(descriptors.keys());
				const order = new Map(pending.orderIds.map((id, index) => [id, index]));
				lastRegistrationsRef.current = pending;
				committedKeysRef.current = nextKeys;
				committedDescriptorsRef.current = descriptors;
				registry.setSnapshot((current) => {
					const nextCompositions = reconcileRegistryEntries({
						current: current.compositions,
						entries: pending.compositions,
						previousDescriptors,
						previousKeys,
						nextKeys,
						getKey: (composition) => `composition:${composition.id}`,
						order,
						orderProperty: 'order',
					});
					const nextFolders = reconcileRegistryEntries({
						current: current.folders,
						entries: pending.folders,
						previousDescriptors,
						previousKeys,
						nextKeys,
						getKey: (folder) => `folder:${getFolderOrderId(folder)}`,
						order,
						orderProperty: 'order',
					});
					return nextCompositions === current.compositions &&
						nextFolders === current.folders
						? current
						: {compositions: nextCompositions, folders: nextFolders};
				});
			});
		},
		[registry],
	);

	useIsomorphicLayoutEffect(() => {
		if (!isStudio) {
			return;
		}

		let unmounted = false;
		unmountedRef.current = false;
		const onRegistrationError = () => {
			if (observerFailedRef.current) {
				return;
			}

			observerFailedRef.current = true;
			pendingRegistrationsRef.current = null;
			queueMicrotask(() => {
				if (unmounted) {
					return;
				}

				const previousKeys = committedKeysRef.current;
				committedKeysRef.current = new Set();
				committedDescriptorsRef.current = new Map();
				registry.setSnapshot((current) => ({
					compositions: current.compositions.filter(
						(composition) => !previousKeys.has(`composition:${composition.id}`),
					),
					folders: current.folders.filter(
						(folder) => !previousKeys.has(`folder:${getFolderOrderId(folder)}`),
					),
				}));
				setCommitRegistrationEnabled(false);
			});
		};

		const onCommitOrder = (event: Event) => {
			const {detail} = event as CustomEvent<CommitOrderEventDetail>;
			const managerOrder = detail.compositionManagers.find(
				(item) => item.managerId === compositionManagerId,
			);
			if (!managerOrder) {
				return;
			}

			const orderIds = managerOrder.compositionAndFolderOrder.map(
				getCompositionAndFolderOrderKey,
			);
			const previousOrder = committedOrderIdsRef.current;
			if (
				previousOrder !== null &&
				previousOrder.length === orderIds.length &&
				previousOrder.every((id, index) => id === orderIds[index])
			) {
				return;
			}

			const order = new Map(orderIds.map((id, index) => [id, index]));
			committedOrderIdsRef.current = orderIds;
			committedOrderRef.current = order;
			if (commitRegistrationEnabled) {
				return;
			}

			queueMicrotask(() => {
				if (unmounted) {
					return;
				}

				updateCompositions((currentCompositions) => {
					let changed = false;
					const nextCompositions = currentCompositions.map((composition) => {
						const nextOrder =
							order.get(
								getCompositionAndFolderOrderKey({
									type: 'composition',
									id: composition.id,
								}),
							) ??
							internalOrderRef.current.get(
								getCompositionAndFolderOrderKey({
									type: 'composition',
									id: composition.id,
								}),
							) ??
							composition.order;
						if (nextOrder === composition.order) {
							return composition;
						}

						changed = true;
						return {...composition, order: nextOrder};
					});
					return changed ? nextCompositions : currentCompositions;
				});
				setFolders((currentFolders) => {
					let changed = false;
					const nextFolders = currentFolders.map((folder) => {
						const nextOrder =
							order.get(
								getCompositionAndFolderOrderKey({
									type: 'folder',
									id: getFolderOrderId(folder),
								}),
							) ??
							internalOrderRef.current.get(
								getCompositionAndFolderOrderKey({
									type: 'folder',
									id: getFolderOrderId(folder),
								}),
							) ??
							folder.order;
						if (nextOrder === folder.order) {
							return folder;
						}

						changed = true;
						return {...folder, order: nextOrder};
					});
					return changed ? nextFolders : currentFolders;
				});
			});
		};

		window.addEventListener(COMMIT_ORDER_EVENT, onCommitOrder);
		window.addEventListener(
			COMMIT_REGISTRATION_ERROR_EVENT,
			onRegistrationError,
		);

		return () => {
			unmounted = true;
			unmountedRef.current = true;
			pendingRegistrationsRef.current = null;
			window.removeEventListener(COMMIT_ORDER_EVENT, onCommitOrder);
			window.removeEventListener(
				COMMIT_REGISTRATION_ERROR_EVENT,
				onRegistrationError,
			);
		};
	}, [
		compositionManagerId,
		isStudio,
		updateCompositions,
		setFolders,
		registry,
		commitRegistrationEnabled,
	]);

	useImperativeHandle(compositionsRef, () => {
		return {
			getCompositions: () => registry.getSnapshot().compositions,
		};
	}, [registry]);

	const compositionManagerSetters = useMemo((): CompositionManagerSetters => {
		return {
			registerComposition,
			unregisterComposition,
			registerFolder,
			unregisterFolder,
			setCanvasContent,
			setCurrentAssetMetadata,
			onlyRenderComposition,
		};
	}, [
		registerComposition,
		registerFolder,
		unregisterComposition,
		unregisterFolder,
		onlyRenderComposition,
	]);

	const compositionManagerContextValue =
		useMemo((): CompositionManagerContext => {
			return {
				compositions,
				folders,
				currentCompositionMetadata,
				currentAssetMetadata,
				canvasContent,
			};
		}, [
			compositions,
			folders,
			currentCompositionMetadata,
			currentAssetMetadata,
			canvasContent,
		]);

	const providers = (
		<CompositionManager.Provider value={compositionManagerContextValue}>
			<CompositionSetters.Provider value={compositionManagerSetters}>
				<CompositionCommitRegistrationContext.Provider
					value={commitRegistrationEnabled ? compositionManagerSetters : null}
				>
					{children}
				</CompositionCommitRegistrationContext.Provider>
			</CompositionSetters.Provider>
		</CompositionManager.Provider>
	);

	if (registrationError !== null) {
		throw registrationError;
	}

	return isStudio ? (
		<CompositionManagerOrderMarker
			managerId={compositionManagerId}
			onCommitRegistrations={
				commitRegistrationEnabled ? onCommitRegistrations : null
			}
		>
			{providers}
		</CompositionManagerOrderMarker>
	) : (
		providers
	);
};
