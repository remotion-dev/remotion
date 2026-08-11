import {useCallback, useContext} from 'react';
import {Internals} from 'remotion';
import type {ExpandedFoldersState} from '../helpers/persist-open-folders';
import {FolderContext} from '../state/folders';
import {explorerSidebarTabs} from './ExplorerPanelRef';

export const useSelectAsset = () => {
	const {setCanvasContent} = useContext(Internals.CompositionSetters);
	const {setAssetFoldersExpanded} = useContext(FolderContext);

	return useCallback(
		(asset: string) => {
			setCanvasContent({type: 'asset', asset});
			explorerSidebarTabs.current?.selectAssetsPanel();
			setAssetFoldersExpanded((ex) => {
				const split = asset.split('/');

				const keysToExpand = split.map((_, i) => {
					return split.slice(0, i).join('/');
				});
				const newState: ExpandedFoldersState = {
					...ex,
				};
				for (const key of keysToExpand) {
					newState[key] = true;
				}

				return newState;
			});
		},
		[setAssetFoldersExpanded, setCanvasContent],
	);
};
