import {createContext} from 'react';
import {
	loadPersistedBooleanMap,
	persistBooleanMap,
	type BooleanMap,
} from './persist-boolean-map';

export const openFolderKey = ({
	folderName,
	parentName,
}: {
	folderName: string;
	parentName: string | null;
}) => {
	return [parentName ?? 'no-parent', folderName].join('/');
};

export type ExpandedFoldersState = BooleanMap;

const sessionStorageKey = (type: PersistanceType) =>
	type === 'compositions'
		? 'remotion.expandedFolders'
		: 'remotion.expandedAssetFolders';

type PersistanceType = 'assets' | 'compositions';

export const persistExpandedFolders = (
	type: PersistanceType,
	state: ExpandedFoldersState,
) => {
	persistBooleanMap(sessionStorageKey(type), state);
};

export const loadExpandedFolders = (
	type: PersistanceType,
): ExpandedFoldersState => {
	return loadPersistedBooleanMap(sessionStorageKey(type));
};

export type ExpandedFoldersRef = {
	toggleFolder: (folderName: string, parentName: string | null) => void;
	foldersExpanded: ExpandedFoldersState;
	setFoldersExpanded: (foldersExpanded: ExpandedFoldersState) => void;
};

export const ExpandedFoldersContext = createContext<ExpandedFoldersRef>({
	toggleFolder: () => {},
	foldersExpanded: {},
	setFoldersExpanded: () => {},
});
