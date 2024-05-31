export const openFolderKey = ({
	folderName,
	parentName,
}: {
	folderName: string;
	parentName: string | null;
}) => {
	return [parentName ?? 'no-parent', folderName].join('/');
};

export type ExpandedFoldersState = Record<string, boolean>;

const localStorageKey = (type: PersistanceType) =>
	type === 'compositions'
		? 'remotion.expandedFolders'
		: 'remotion.expandedAssetFolders';

type PersistanceType = 'assets' | 'compositions';

export const persistExpandedFolders = (
	type: PersistanceType,
	state: ExpandedFoldersState,
) => {
	window.localStorage.setItem(localStorageKey(type), JSON.stringify(state));
};

export const loadExpandedFolders = (
	type: PersistanceType,
): ExpandedFoldersState => {
	const item = window.localStorage.getItem(localStorageKey(type));
	if (item === null) {
		return {};
	}

	return JSON.parse(item);
};
