import type {
	CompositionDestination,
	CompositionEditResponse,
	CompositionOrFolder,
	HotMiddlewareMessage,
} from '@remotion/studio-shared';
import {useEffect, useMemo} from 'react';
import type {_InternalTypes, TFolder} from 'remotion';
import type {
	CompositionSelectorItemType,
	SourceFileRemap,
} from '../components/CompositionSelectorItem';
import {
	createFolderTree,
	splitParentIntoNameAndParent,
} from './create-folder-tree';
import {openFolderKey} from './persist-open-folders';
import {useSyncExternalStore} from './use-sync-external-store';

type OptimisticCompositionMove = {
	readonly type: 'move';
	readonly item: CompositionOrFolder;
	readonly destination: CompositionDestination;
	// Project-relative files of the item's registration. A move into a
	// destination registered in another file relocates it there.
	readonly sourceFile: string | null;
	readonly destinationFile: string | null;
};

export type OptimisticCompositionOperation =
	| OptimisticCompositionMove
	| {
			readonly type: 'delete';
			readonly compositionId: string;
	  };

export type CompositionRegistrySnapshot = {
	readonly compositions: _InternalTypes['AnyComposition'][];
	readonly folders: TFolder[];
};

type PendingCompositionOperation = {
	readonly operation: OptimisticCompositionOperation;
	// `saving`: queued or being persisted.
	// `saved`: persisted, but no build has been reported since.
	// `built`: a build finished after it was persisted. Once that build is
	// installed, a registry other than `baseline` reflects the persisted source.
	readonly status: 'saving' | 'saved' | 'built';
	readonly build: {
		readonly hash: string | null;
		readonly baseline: CompositionRegistrySnapshot;
	} | null;
};

// Hashes of reported builds, oldest first.
const buildHashes: string[] = [];

const isBuildInstalled = (hash: string | null) => {
	const installed =
		typeof __webpack_hash__ === 'string' ? __webpack_hash__ : null;
	if (hash === null || installed === null) {
		return true;
	}

	const index = buildHashes.lastIndexOf(hash);
	return index === -1 || buildHashes.lastIndexOf(installed) >= index;
};

let pending: readonly PendingCompositionOperation[] = [];
let getRegistrySnapshot: (() => CompositionRegistrySnapshot) | null = null;
const listeners = new Set<() => void>();

const setPending = (next: readonly PendingCompositionOperation[]) => {
	if (next === pending) {
		return;
	}

	pending = next;
	for (const listener of listeners) {
		listener();
	}
};

const subscribe = (listener: () => void) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};

const getPending = () => pending;

const getTreeShape = (items: CompositionSelectorItemType[]): unknown[] =>
	items.map((item) =>
		item.type === 'composition'
			? item.composition.id
			: [item.folderName, getTreeShape(item.items)],
	);

// Returns the entries that still have to be projected onto `snapshot`. Live
// registry updates (for example metadata from React state) do not retire an
// edit, only a reported build or a registry that already contains the edit.
const reconcile = (
	entries: readonly PendingCompositionOperation[],
	snapshot: CompositionRegistrySnapshot,
): readonly PendingCompositionOperation[] => {
	let tree: CompositionSelectorItemType[] | null = null;
	let oldest = true;
	const next = entries.filter(({operation, status, build}) => {
		if (
			status === 'built' &&
			build !== null &&
			(build.baseline.compositions !== snapshot.compositions ||
				build.baseline.folders !== snapshot.folders) &&
			isBuildInstalled(build.hash)
		) {
			return false;
		}

		// Only the oldest edit can be compared with the registry. Newer edits were
		// made on top of edits whose source may not have been reloaded yet.
		if (oldest && status !== 'saving') {
			if (operation.type === 'delete') {
				if (
					!snapshot.compositions.some(({id}) => id === operation.compositionId)
				) {
					return false;
				}
			} else {
				tree ??= createFolderTree(snapshot.compositions, snapshot.folders, {});
				const moved = applyMove({tree, operation, foldersExpanded: {}});
				if (
					moved !== null &&
					JSON.stringify(getTreeShape(moved)) ===
						JSON.stringify(getTreeShape(tree))
				) {
					return false;
				}
			}
		}

		oldest = false;
		return true;
	});
	return next.length === entries.length ? entries : next;
};

export const getActiveOptimisticCompositionOperations = (
	snapshot: CompositionRegistrySnapshot,
): OptimisticCompositionOperation[] =>
	reconcile(pending, snapshot).map(({operation}) => operation);

// Called for every hot reload message. Edits persisted before a successful
// build are contained in it.
export const observeCompositionOperationsBuild = (
	event: HotMiddlewareMessage,
) => {
	if (
		(event.action !== 'built' && event.action !== 'sync') ||
		event.errors.length > 0
	) {
		return;
	}

	if (event.hash !== undefined) {
		buildHashes.push(event.hash);
		if (buildHashes.length > 100) {
			buildHashes.shift();
		}
	}

	if (
		getRegistrySnapshot === null ||
		!pending.some(({status}) => status === 'saved')
	) {
		return;
	}

	const build = {hash: event.hash ?? null, baseline: getRegistrySnapshot()};
	setPending(
		pending.map((entry) =>
			entry.status === 'saved' ? {...entry, status: 'built', build} : entry,
		),
	);
};

// Shows the operation immediately and keeps it until hot reload delivers the
// persisted source. Failed edits roll back only their own operation, so newer
// queued edits stay visible.
export const applyOptimisticCompositionOperation = async <
	T extends CompositionEditResponse,
>({
	operation,
	getSnapshot,
	persist,
}: {
	readonly operation: OptimisticCompositionOperation;
	readonly getSnapshot: () => CompositionRegistrySnapshot;
	readonly persist: () => Promise<T>;
}): Promise<T> => {
	getRegistrySnapshot = getSnapshot;
	const entry: PendingCompositionOperation = {
		operation,
		status: 'saving',
		build: null,
	};
	setPending([...pending, entry]);

	const settle = (success: boolean) => {
		setPending(
			reconcile(
				pending.flatMap((candidate) => {
					if (candidate !== entry) {
						return [candidate];
					}

					return success
						? [{operation, status: 'saved' as const, build: null}]
						: [];
				}),
				getSnapshot(),
			),
		);
	};

	try {
		const result = await persist();
		settle(result.success);
		return result;
	} catch (error) {
		settle(false);
		throw error;
	}
};

const getFolderPath = ({
	folderName,
	parentName,
}: {
	readonly folderName: string;
	readonly parentName: string | null;
}) => [parentName, folderName].filter(Boolean).join('/');

const matchesDescriptor = (
	item: CompositionSelectorItemType,
	descriptor: CompositionOrFolder,
) =>
	descriptor.type === 'composition'
		? item.type === 'composition' &&
			item.composition.id === descriptor.compositionId
		: item.type === 'folder' &&
			item.folderName === descriptor.folderName &&
			item.parentName === descriptor.parentName;

const moveIntoFolderPath = ({
	item,
	folderPath,
	foldersExpanded,
}: {
	readonly item: CompositionSelectorItemType;
	readonly folderPath: string | null;
	readonly foldersExpanded: Record<string, boolean>;
}): CompositionSelectorItemType => {
	if (item.type === 'composition') {
		const {name, parent} = splitParentIntoNameAndParent(folderPath);
		if (
			item.composition.folderName === name &&
			item.composition.parentFolderName === parent
		) {
			return item;
		}

		return {
			...item,
			composition: {
				...item.composition,
				folderName: name,
				parentFolderName: parent,
			},
		};
	}

	if (item.parentName === folderPath) {
		return item;
	}

	const nextPath = getFolderPath({
		folderName: item.folderName,
		parentName: folderPath,
	});
	return {
		...item,
		parentName: folderPath,
		folder: {...item.folder, parent: folderPath},
		expanded:
			foldersExpanded[
				openFolderKey({folderName: item.folderName, parentName: folderPath})
			] ?? false,
		items: item.items.map((child) =>
			moveIntoFolderPath({item: child, folderPath: nextPath, foldersExpanded}),
		),
	};
};

const replaceAt = (
	items: CompositionSelectorItemType[],
	index: number,
	replacement: CompositionSelectorItemType[],
	deleteCount: number,
) => [
	...items.slice(0, index),
	...replacement,
	...items.slice(index + deleteCount),
];

const removeFromTree = (
	items: CompositionSelectorItemType[],
	descriptor: CompositionOrFolder,
): {
	items: CompositionSelectorItemType[];
	removed: CompositionSelectorItemType | null;
} => {
	for (let index = 0; index < items.length; index++) {
		const item = items[index];
		if (matchesDescriptor(item, descriptor)) {
			return {items: replaceAt(items, index, [], 1), removed: item};
		}

		if (item.type === 'folder') {
			const result = removeFromTree(item.items, descriptor);
			if (result.removed !== null) {
				return {
					items: replaceAt(items, index, [{...item, items: result.items}], 1),
					removed: result.removed,
				};
			}
		}
	}

	return {items, removed: null};
};

// Mirrors the codemod: root and folder destinations append the item at the end.
const insertIntoTree = ({
	items,
	item,
	destination,
	folderPath,
	foldersExpanded,
}: {
	readonly items: CompositionSelectorItemType[];
	readonly item: CompositionSelectorItemType;
	readonly destination: CompositionDestination;
	readonly folderPath: string | null;
	readonly foldersExpanded: Record<string, boolean>;
}): CompositionSelectorItemType[] | null => {
	if (destination.type === 'root') {
		return [
			...items,
			moveIntoFolderPath({item, folderPath: null, foldersExpanded}),
		];
	}

	for (let index = 0; index < items.length; index++) {
		const candidate = items[index];
		if (destination.type !== 'folder') {
			if (matchesDescriptor(candidate, destination.target)) {
				return replaceAt(
					items,
					destination.type === 'before' ? index : index + 1,
					[moveIntoFolderPath({item, folderPath, foldersExpanded})],
					0,
				);
			}
		} else if (
			candidate.type === 'folder' &&
			candidate.folderName === destination.folderName &&
			candidate.parentName === destination.parentName
		) {
			return replaceAt(
				items,
				index,
				[
					{
						...candidate,
						items: [
							...candidate.items,
							moveIntoFolderPath({
								item,
								folderPath: getFolderPath(candidate),
								foldersExpanded,
							}),
						],
					},
				],
				1,
			);
		}

		if (candidate.type === 'folder') {
			const children = insertIntoTree({
				items: candidate.items,
				item,
				destination,
				folderPath: getFolderPath(candidate),
				foldersExpanded,
			});
			if (children !== null) {
				return replaceAt(items, index, [{...candidate, items: children}], 1);
			}
		}
	}

	return null;
};

const appendSourceFileRemap = (
	item: CompositionSelectorItemType,
	remap: SourceFileRemap,
): CompositionSelectorItemType => {
	const sourceFileRemaps = [...item.sourceFileRemaps, remap];
	return item.type === 'composition'
		? {...item, sourceFileRemaps}
		: {
				...item,
				sourceFileRemaps,
				items: item.items.map((child) => appendSourceFileRemap(child, remap)),
			};
};

const applyMove = ({
	tree,
	operation,
	foldersExpanded,
}: {
	readonly tree: CompositionSelectorItemType[];
	readonly operation: OptimisticCompositionMove;
	readonly foldersExpanded: Record<string, boolean>;
}): CompositionSelectorItemType[] | null => {
	const {items, removed} = removeFromTree(tree, operation.item);
	if (removed === null) {
		return null;
	}

	// Rows moved into another file must report that file, so follow-up edits
	// queued before hot reload address the registration where it will be.
	const {sourceFile, destinationFile} = operation;
	return insertIntoTree({
		items,
		item:
			sourceFile !== null &&
			destinationFile !== null &&
			sourceFile !== destinationFile
				? appendSourceFileRemap(removed, {
						from: sourceFile,
						to: destinationFile,
					})
				: removed,
		destination: operation.destination,
		folderPath: null,
		foldersExpanded,
	});
};

export const applyOptimisticCompositionOperations = ({
	items,
	operations,
	foldersExpanded,
}: {
	readonly items: CompositionSelectorItemType[];
	readonly operations: readonly OptimisticCompositionOperation[];
	readonly foldersExpanded: Record<string, boolean>;
}): CompositionSelectorItemType[] => {
	return operations.reduce((tree, operation) => {
		if (operation.type === 'delete') {
			return removeFromTree(tree, {
				type: 'composition',
				compositionId: operation.compositionId,
			}).items;
		}

		return applyMove({tree, operation, foldersExpanded}) ?? tree;
	}, items);
};

export const useOptimisticCompositionOperations = ({
	compositions,
	folders,
}: CompositionRegistrySnapshot): OptimisticCompositionOperation[] => {
	const all = useSyncExternalStore(subscribe, getPending, getPending);

	useEffect(() => {
		setPending(reconcile(pending, {compositions, folders}));
	}, [compositions, folders]);

	return useMemo(
		() =>
			reconcile(all, {compositions, folders}).map(({operation}) => operation),
		[all, compositions, folders],
	);
};

// Navigation targets: compositions that are not being deleted.
export const useCompositionsWithoutPendingDeletions = (
	snapshot: CompositionRegistrySnapshot,
): _InternalTypes['AnyComposition'][] => {
	const operations = useOptimisticCompositionOperations(snapshot);
	const {compositions} = snapshot;
	return useMemo(() => {
		const deleted = new Set(
			operations.flatMap((operation) =>
				operation.type === 'delete' ? [operation.compositionId] : [],
			),
		);
		return deleted.size === 0
			? compositions
			: compositions.filter(({id}) => !deleted.has(id));
	}, [compositions, operations]);
};
