import React, {createContext, useCallback, useMemo, useState} from 'react';
import type {ExpandedFoldersState} from '../helpers/persist-open-folders';
import {loadExpandedFolders} from '../helpers/persist-open-folders';

// 'registration' keeps the order in which compositions and folders are
// registered, 'alphabetical' sorts them by name on every level of the tree.
export type CompositionSortOrder = 'registration' | 'alphabetical';

const compositionSortOrderKey = 'remotion.compositionSortOrder';

const loadCompositionSortOrder = (): CompositionSortOrder => {
	if (typeof window === 'undefined') {
		return 'registration';
	}

	try {
		return window.localStorage.getItem(compositionSortOrderKey) ===
			'alphabetical'
			? 'alphabetical'
			: 'registration';
	} catch {
		return 'registration';
	}
};

const persistCompositionSortOrder = (sortOrder: CompositionSortOrder) => {
	try {
		window.localStorage.setItem(compositionSortOrderKey, sortOrder);
	} catch {
		// Ignore quota errors or disabled storage.
	}
};

type TFolderContext = {
	compositionFoldersExpanded: ExpandedFoldersState;
	setCompositionFoldersExpanded: React.Dispatch<
		React.SetStateAction<ExpandedFoldersState>
	>;
	assetFoldersExpanded: ExpandedFoldersState;
	setAssetFoldersExpanded: React.Dispatch<
		React.SetStateAction<ExpandedFoldersState>
	>;
	compositionSortOrder: CompositionSortOrder;
	setCompositionSortOrder: (sortOrder: CompositionSortOrder) => void;
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
	compositionSortOrder: 'registration',
	setCompositionSortOrder: () => {
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

	const [compositionSortOrder, setCompositionSortOrderState] =
		useState<CompositionSortOrder>(loadCompositionSortOrder);

	const setCompositionSortOrder = useCallback(
		(sortOrder: CompositionSortOrder) => {
			persistCompositionSortOrder(sortOrder);
			setCompositionSortOrderState(sortOrder);
		},
		[],
	);

	const value = useMemo((): TFolderContext => {
		return {
			compositionFoldersExpanded,
			setCompositionFoldersExpanded,
			assetFoldersExpanded,
			setAssetFoldersExpanded,
			compositionSortOrder,
			setCompositionSortOrder,
		};
	}, [
		assetFoldersExpanded,
		compositionFoldersExpanded,
		compositionSortOrder,
		setCompositionSortOrder,
	]);

	return (
		<FolderContext.Provider value={value}>{children}</FolderContext.Provider>
	);
};
