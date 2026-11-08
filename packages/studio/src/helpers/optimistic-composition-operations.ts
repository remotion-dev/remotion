import type {
	CompositionDestination,
	CompositionEditResponse,
	CompositionOrFolder,
} from '@remotion/studio-shared';
import {useEffect, useMemo} from 'react';
import type {_InternalTypes, TFolder} from 'remotion';
import type {CompositionSelectorItemType} from '../components/CompositionSelectorItem';
import {splitParentIntoNameAndParent} from './create-folder-tree';
import {openFolderKey} from './persist-open-folders';
import {useSyncExternalStore} from './use-sync-external-store';

export type OptimisticCompositionOperation =
	| {
			readonly type: 'move';
			readonly item: CompositionOrFolder;
			readonly destination: CompositionDestination;
	  }
	| {
			readonly type: 'delete';
			readonly compositionId: string;
	  };

export type CompositionRegistrySnapshot = {
	readonly compositions: readonly _InternalTypes['AnyComposition'][];
	readonly folders: readonly TFolder[];
};

type PendingCompositionOperation = {
	readonly operation: OptimisticCompositionOperation;
	// `null` while the edit is queued or being persisted. Afterwards, the
	// registry snapshot that was current when persistence succeeded. Once Studio
	// commits a different snapshot, hot reload has delivered the edit and the
	// source is authoritative again.
	readonly baseline: CompositionRegistrySnapshot | null;
};

let pending: readonly PendingCompositionOperation[] = [];
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

const isSettled = (
	{baseline}: PendingCompositionOperation,
	snapshot: CompositionRegistrySnapshot,
) =>
	baseline !== null &&
	(baseline.compositions !== snapshot.compositions ||
		baseline.folders !== snapshot.folders);

const pruneSettled = (snapshot: CompositionRegistrySnapshot) => {
	if (pending.some((entry) => isSettled(entry, snapshot))) {
		setPending(pending.filter((entry) => !isSettled(entry, snapshot)));
	}
};

const getActive = (
	entries: readonly PendingCompositionOperation[],
	snapshot: CompositionRegistrySnapshot,
): OptimisticCompositionOperation[] =>
	entries
		.filter((entry) => !isSettled(entry, snapshot))
		.map(({operation}) => operation);

export const getActiveOptimisticCompositionOperations = (
	snapshot: CompositionRegistrySnapshot,
) => getActive(pending, snapshot);

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
	const entry: PendingCompositionOperation = {operation, baseline: null};
	setPending([...pending, entry]);

	const settle = (success: boolean) => {
		const snapshot = getSnapshot();
		setPending(
			pending.flatMap((candidate) => {
				if (candidate === entry) {
					return success ? [{operation, baseline: snapshot}] : [];
				}

				return isSettled(candidate, snapshot) ? [] : [candidate];
			}),
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

		const {items: withoutItem, removed} = removeFromTree(tree, operation.item);
		if (removed === null) {
			return tree;
		}

		return (
			insertIntoTree({
				items: withoutItem,
				item: removed,
				destination: operation.destination,
				folderPath: null,
				foldersExpanded,
			}) ?? tree
		);
	}, items);
};

export const useOptimisticCompositionOperations = ({
	compositions,
	folders,
}: CompositionRegistrySnapshot): OptimisticCompositionOperation[] => {
	const all = useSyncExternalStore(subscribe, getPending, getPending);

	useEffect(() => {
		pruneSettled({compositions, folders});
	}, [compositions, folders]);

	return useMemo(
		() => getActive(all, {compositions, folders}),
		[all, compositions, folders],
	);
};
