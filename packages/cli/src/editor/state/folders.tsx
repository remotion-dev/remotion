import React, {createContext, useMemo, useState} from 'react';
import type {ExpandedFoldersState} from '../helpers/persist-open-folders';
import {loadExpandedFolders} from '../helpers/persist-open-folders';

type TFolderContext = {
	foldersExpanded: ExpandedFoldersState;
	setFoldersExpanded: React.Dispatch<
		React.SetStateAction<ExpandedFoldersState>
	>;
};

export const FolderContext = createContext<TFolderContext>({
	foldersExpanded: {},
	setFoldersExpanded: () => {
		throw new Error('default state');
	},
});

export const FolderContextProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [foldersExpanded, setFoldersExpanded] = useState<ExpandedFoldersState>(
		loadExpandedFolders()
	);

	const value = useMemo((): TFolderContext => {
		return {
			foldersExpanded,
			setFoldersExpanded,
		};
	}, [foldersExpanded]);

	return (
		<FolderContext.Provider value={value}>{children}</FolderContext.Provider>
	);
};
