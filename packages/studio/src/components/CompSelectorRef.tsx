import type React from 'react';
import {useCallback, useContext, useImperativeHandle, useMemo} from 'react';
import {Internals} from 'remotion';
import {getKeysToExpand} from '../helpers/create-folder-tree';
import type {
	ExpandedFoldersRef,
	ExpandedFoldersState,
} from '../helpers/persist-open-folders';
import {
	ExpandedFoldersContext,
	openFolderKey,
	persistExpandedFolders,
} from '../helpers/persist-open-folders';
import {FolderContext} from '../state/folders';
import {useSelectComposition} from './InitialCompositionLoader';

export const CompSelectorRef: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {compositions} = useContext(Internals.CompositionManager);
	const {compositionFoldersExpanded, setCompositionFoldersExpanded} =
		useContext(FolderContext);

	const selectComposition = useSelectComposition();

	const toggleFolder = useCallback(
		(folderName: string, parentName: string | null) => {
			setCompositionFoldersExpanded((p) => {
				const key = openFolderKey({folderName, parentName});
				const prev = p[key] ?? false;
				const foldersExpandedState: ExpandedFoldersState = {
					...p,
					[key]: !prev,
				};
				persistExpandedFolders('compositions', foldersExpandedState);
				return foldersExpandedState;
			});
		},
		[setCompositionFoldersExpanded],
	);

	useImperativeHandle(
		Internals.compositionSelectorRef,
		() => {
			return {
				expandComposition: (compName) => {
					const compositionToExpand = compositions.find(
						(c) => c.id === compName,
					);
					if (!compositionToExpand) {
						return;
					}

					const {folderName, parentFolderName} = compositionToExpand;
					if (folderName === null) {
						return;
					}

					setCompositionFoldersExpanded((previousState) => {
						const keysToExpand = getKeysToExpand(folderName, parentFolderName);
						const foldersExpandedState: ExpandedFoldersState = {
							...previousState,
						};
						for (const key of keysToExpand) {
							foldersExpandedState[key] = true;
						}

						persistExpandedFolders('compositions', foldersExpandedState);

						return foldersExpandedState;
					});
				},
				selectComposition: (compName) => {
					const comp = compositions.find((c) => c.id === compName);
					if (!comp) {
						throw new Error(`Composition ${compName} not found`);
					}

					selectComposition(comp, true);
				},
				toggleFolder: (folderName, parentName) => {
					toggleFolder(folderName, parentName);
				},
			};
		},
		[
			compositions,
			selectComposition,
			setCompositionFoldersExpanded,
			toggleFolder,
		],
	);

	const contextValue: ExpandedFoldersRef = useMemo(() => {
		return {
			foldersExpanded: compositionFoldersExpanded,
			setFoldersExpanded: (foldersExpanded) => {
				setCompositionFoldersExpanded(foldersExpanded);
				persistExpandedFolders('compositions', foldersExpanded);
			},
			toggleFolder,
		};
	}, [compositionFoldersExpanded, setCompositionFoldersExpanded, toggleFolder]);

	return (
		<ExpandedFoldersContext.Provider value={contextValue}>
			{children}
		</ExpandedFoldersContext.Provider>
	);
};
