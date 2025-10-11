import React, {createContext, useMemo, useState} from 'react';
import type {ExpandedFoldersState} from '../helpers/persist-open-folders';
import {loadExpandedFolders} from '../helpers/persist-open-folders';

type TFolderContext = {
	compositionFoldersExpanded: ExpandedFoldersState;
	setCompositionFoldersExpanded: React.Dispatch<
		React.SetStateAction<ExpandedFoldersState>
	>;
	assetFoldersExpanded: ExpandedFoldersState;
	setAssetFoldersExpanded: React.Dispatch<
		React.SetStateAction<ExpandedFoldersState>
	>;
};

export const FolderContext = createContext<TFolderContext>({
	compositionFoldersExpanded: {},
	setCompositionFoldersExpanded: () => {
		throw new Error('default state');
	},
	assetFoldersExpanded: {},
	setAssetFoldersExpanded: () => {
		throw new Error('default state');
	},
});

export const FolderContextProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [compositionFoldersExpanded, setCompositionFoldersExpanded] =
		useState<ExpandedFoldersState>(() => loadExpandedFolders('compositions'));

	const [assetFoldersExpanded, setAssetFoldersExpanded] =
		useState<ExpandedFoldersState>(() => loadExpandedFolders('assets'));

	const value = useMemo((): TFolderContext => {
		return {
			compositionFoldersExpanded,
			setCompositionFoldersExpanded,
			assetFoldersExpanded,
			setAssetFoldersExpanded,
		};
	}, [assetFoldersExpanded, compositionFoldersExpanded]);

	return (
		<FolderContext.Provider value={value}>{children}</FolderContext.Provider>
	);
};
