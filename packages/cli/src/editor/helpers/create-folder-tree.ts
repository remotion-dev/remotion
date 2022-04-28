import {TComposition, TFolder} from 'remotion';
import {CompositionSelectorItemType} from '../components/CompositionSelectorItem';

const doesFolderExist = (
	items: CompositionSelectorItemType[],
	folderName: string
): CompositionSelectorItemType[] | false => {
	for (const item of items) {
		if (item.type === 'folder') {
			if (item.folderName === folderName) {
				return item.items;
			}

			const found = doesFolderExist(item.items, folderName);
			if (found !== false) {
				return found;
			}
		}
	}

	return false;
};

export const findItemListToPush = (
	items: CompositionSelectorItemType[],
	folderName: string | null
): CompositionSelectorItemType[] => {
	if (folderName === null) {
		return items;
	}

	const folder = doesFolderExist(items, folderName);
	if (!folder) {
		throw new Error('did not find folder ' + folderName);
	}

	return folder;
};

const createFolderIfDoesNotExist = (
	items: CompositionSelectorItemType[],
	availableFolders: TFolder[],
	folderItem: TFolder,
	foldersExpanded: Record<string, boolean>
) => {
	if (doesFolderExist(items, folderItem.name)) {
		return;
	}

	if (folderItem.parent) {
		const parent = availableFolders.find((f) => f.name === folderItem.parent);
		if (!parent) {
			throw new Error('unexpectedly did not have parent');
		}

		createFolderIfDoesNotExist(
			items,
			availableFolders,
			parent,
			foldersExpanded
		);
	}

	const itemList = findItemListToPush(items, folderItem.parent);
	if (!itemList) {
		throw new Error('why did folder not exist? ' + folderItem.name);
	}

	itemList.push({
		type: 'folder',
		folderName: folderItem.name,
		items: [],
		key: folderItem.name,
		expanded: foldersExpanded[folderItem.name] ?? false,
	});
};

export const createFolderTree = (
	comps: TComposition<unknown>[],
	folders: TFolder[],
	foldersExpanded: Record<string, boolean>
): CompositionSelectorItemType[] => {
	const items: CompositionSelectorItemType[] = [];

	for (const folder of folders) {
		createFolderIfDoesNotExist(items, folders, folder, foldersExpanded);
	}

	for (const item of comps) {
		const toPush: CompositionSelectorItemType = {
			type: 'composition',
			composition: item,
			key: item.id,
		};
		const list = findItemListToPush(items, item.folderName);
		list.push(toPush);
	}

	return items;
};
