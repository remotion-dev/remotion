import {
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	getFolderOrderId,
	type CommittedCompositionSnapshot,
} from './committed-metadata.js';
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
import {CompositionRegistryProvider} from './CompositionRegistryProvider.js';
import type {TFolder} from './Folder';
import {
	createRegistryStore,
	reconcileRegistryEntries,
} from './registry-store.js';
import {useSyncExternalStore} from './use-sync-external-store.js';

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
	const committedKeysRef = useRef<ReadonlySet<string>>(new Set());
	const committedDescriptorsRef = useRef<
		ReadonlyMap<string, AnyComposition | TFolder>
	>(new Map());
	const [registrationError, setRegistrationError] = useState<Error | null>(
		null,
	);
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
	const onCommitRegistrations = useCallback(
		(pending: CommittedCompositionSnapshot) => {
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
		},
		[registry],
	);

	useImperativeHandle(compositionsRef, () => {
		return {
			getCompositions: () => registry.getSnapshot().compositions,
		};
	}, [registry]);

	const compositionManagerSetters = useMemo(
		(): CompositionManagerSetters => ({
			setCanvasContent,
			setCurrentAssetMetadata,
			onlyRenderComposition,
		}),
		[onlyRenderComposition],
	);

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

	if (registrationError !== null) {
		throw registrationError;
	}

	return (
		<CompositionRegistryProvider onSnapshot={onCommitRegistrations}>
			<CompositionManager.Provider value={compositionManagerContextValue}>
				<CompositionSetters.Provider value={compositionManagerSetters}>
					{children}
				</CompositionSetters.Provider>
			</CompositionManager.Provider>
		</CompositionRegistryProvider>
	);
};
