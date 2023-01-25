export const openFolderKey = (
	folderName: string,
	parentName: string | null
) => {
	return [parentName ?? 'no-parent', folderName].join('/');
};

export type ExpandedFoldersState = Record<string, boolean>;

const localStorageKey = 'remotion.expandedFolders';

export const persistExpandedFolders = (state: ExpandedFoldersState) => {
	window.localStorage.setItem(localStorageKey, JSON.stringify(state));
};

export const loadExpandedFolders = (): ExpandedFoldersState => {
	const item = window.localStorage.getItem(localStorageKey);
	if (item === null) {
		return {};
	}

	return JSON.parse(item);
};
