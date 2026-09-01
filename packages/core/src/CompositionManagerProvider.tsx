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
	CompositionSetters,
} from './CompositionManagerContext';
import type {BaseMetadata} from './CompositionManagerContext.js';
import type {TFolder} from './Folder';
import {
	CompositionManagerOrderMarker,
	getCompositionAndFolderOrderKey,
	getFolderOrderId,
	COMMIT_ORDER_EVENT,
	type CommitOrderEventDetail,
} from './sequence-order-marker.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';

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
	const [folders, setFolders] = useState<TFolder[]>([]);
	const [canvasContent, setCanvasContent] = useState<CanvasContent | null>(
		initialCanvasContent,
	);
	const [currentAssetMetadata, setCurrentAssetMetadata] =
		useState<AssetPreviewMetadata | null>(null);
	const [compositions, setCompositions] = useState<AnyComposition[]>(() =>
		initialCompositions.map((composition, order) => ({...composition, order})),
	);

	// CompositionManagerProvider state
	const currentcompositionsRef = useRef<AnyComposition[]>(compositions);

	const updateCompositions = useCallback(
		(updateComps: (comp: AnyComposition[]) => AnyComposition[]) => {
			setCompositions((comps) => {
				const updated = updateComps(comps);
				currentcompositionsRef.current = updated;
				return updated;
			});
		},
		[],
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

	const unregisterComposition = useCallback((id: string) => {
		internalOrderRef.current.delete(
			getCompositionAndFolderOrderKey({type: 'composition', id}),
		);
		setCompositions((comps) => {
			return comps.filter((c) => c.id !== id);
		});
	}, []);

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
		[],
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
		[],
	);

	useIsomorphicLayoutEffect(() => {
		if (!isStudio) {
			return;
		}

		let unmounted = false;
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
		return () => {
			unmounted = true;
			window.removeEventListener(COMMIT_ORDER_EVENT, onCommitOrder);
		};
	}, [compositionManagerId, isStudio, updateCompositions]);

	useImperativeHandle(compositionsRef, () => {
		return {
			getCompositions: () => currentcompositionsRef.current,
		};
	}, []);

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
				{children}
			</CompositionSetters.Provider>
		</CompositionManager.Provider>
	);

	return isStudio ? (
		<CompositionManagerOrderMarker managerId={compositionManagerId}>
			{providers}
		</CompositionManagerOrderMarker>
	) : (
		providers
	);
};
