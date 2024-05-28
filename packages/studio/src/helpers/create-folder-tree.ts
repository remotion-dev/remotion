import type {AnyComposition, StaticFile, TFolder} from 'remotion';
import type {CompositionSelectorItemType} from '../components/CompositionSelectorItem';
import {openFolderKey} from './persist-open-folders';

export type AssetFolder = {
	name: string;
	items: AssetStructure;
	expanded: boolean;
};

export type AssetStructure = {
	files: StaticFile[];
	folders: AssetFolder[];
};

export const buildAssetFolderStructure = (
	files: StaticFile[],
	parentFolderName: string | null,
	foldersExpanded: Record<string, boolean>,
): AssetStructure => {
	const notInFolder = files.filter((f) => !f.name.includes('/'));
	const inFolder = files.filter((f) => f.name.includes('/'));
	const groupedByFolder: {[key: string]: StaticFile[]} = {};
	for (const item of inFolder) {
		const folderName = item.name.split('/')[0];
		if (!groupedByFolder[folderName]) {
			groupedByFolder[folderName] = [];
		}

		groupedByFolder[folderName].push(item);
	}

	return {
		files: notInFolder,
		folders: Object.keys(groupedByFolder).map((folderName) => {
			const filesInFolder = groupedByFolder[folderName];
			const filesWithoutFolderName = filesInFolder.map((f): StaticFile => {
				return {
					...f,
					name: f.name.substring(folderName.length + 1),
				};
			});

			const key = [parentFolderName, folderName].filter(Boolean).join('/');
			const isExpanded = foldersExpanded[key] ?? false;

			return {
				name: folderName,
				items: buildAssetFolderStructure(
					filesWithoutFolderName,
					[parentFolderName, folderName].filter(Boolean).join('/'),
					foldersExpanded,
				),
				expanded: isExpanded,
			};
		}),
	};
};

export const splitParentIntoNameAndParent = (
	name: string | null,
): {name: string | null; parent: string | null} => {
	if (name === null) {
		return {
			name: null,
			parent: null,
		};
	}

	const splitted = name.split('/');
	const lastName = splitted[splitted.length - 1];
	const parentParentArray = splitted.slice(0, splitted.length - 1);
	const parentParent =
		parentParentArray.length === 0 ? null : parentParentArray.join('/');

	return {
		name: lastName,
		parent: parentParent,
	};
};

const doesFolderExist = (
	items: CompositionSelectorItemType[],
	folderName: string,
	parentName: string | null,
): CompositionSelectorItemType[] | false => {
	for (const item of items) {
		if (item.type === 'folder') {
			if (item.folderName === folderName && item.parentName === parentName) {
				return item.items;
			}

			const found = doesFolderExist(item.items, folderName, parentName);
			if (found !== false) {
				return found;
			}
		}
	}

	return false;
};

const findItemListToPush = (
	items: CompositionSelectorItemType[],
	folderName: string | null,
	parentName: string | null,
): CompositionSelectorItemType[] => {
	if (folderName === null) {
		return items;
	}

	const folder = doesFolderExist(items, folderName, parentName);
	if (!folder) {
		// eslint-disable-next-line no-console
		console.log({items, folderName, parentName});
		throw new Error('did not find folder ' + folderName);
	}

	return folder;
};

const createFolderIfDoesNotExist = (
	items: CompositionSelectorItemType[],
	availableFolders: TFolder[],
	folderItem: TFolder,
	foldersExpanded: Record<string, boolean>,
) => {
	if (doesFolderExist(items, folderItem.name, folderItem.parent)) {
		return;
	}

	const splitted = splitParentIntoNameAndParent(folderItem.parent);
	if (folderItem.parent) {
		const parent = availableFolders.find(
			(f) => f.name === splitted.name && f.parent === splitted.parent,
		);
		if (!parent) {
			throw new Error('unexpectedly did not have parent');
		}

		createFolderIfDoesNotExist(
			items,
			availableFolders,
			parent,
			foldersExpanded,
		);
	}

	const itemList = findItemListToPush(items, splitted.name, splitted.parent);
	if (!itemList) {
		throw new Error('why did folder not exist? ' + folderItem.name);
	}

	itemList.push({
		type: 'folder',
		folderName: folderItem.name,
		items: [],
		key: folderItem.name,
		expanded:
			foldersExpanded[
				openFolderKey({
					folderName: folderItem.name,
					parentName: folderItem.parent,
				})
			] ?? false,
		parentName: folderItem.parent,
	});
};

export const createFolderTree = (
	comps: AnyComposition[],
	folders: TFolder[],
	foldersExpanded: Record<string, boolean>,
): CompositionSelectorItemType[] => {
	const items: CompositionSelectorItemType[] = [];
	const uniqueFolderKeys: string[] = [];
	for (const folder of folders) {
		const folderKey = openFolderKey({
			folderName: folder.name,
			parentName: folder.parent,
		});
		if (uniqueFolderKeys.includes(folderKey)) {
			if (folder.parent) {
				throw new Error(
					`Multiple folders with the name ${folder.name} inside the folder ${folder.parent} exist. Folder names must be unique.`,
				);
			}

			throw new Error(
				'Multiple folders with the name ' +
					folder.name +
					' exist. Folder names must be unique.',
			);
		}

		uniqueFolderKeys.push(folderKey);
		createFolderIfDoesNotExist(items, folders, folder, foldersExpanded);
	}

	for (const item of comps) {
		const toPush: CompositionSelectorItemType = {
			type: 'composition',
			composition: item,
			key: item.id,
		};
		const list = findItemListToPush(
			items,
			item.folderName,
			item.parentFolderName,
		);
		list.push(toPush);
	}

	return items;
};
