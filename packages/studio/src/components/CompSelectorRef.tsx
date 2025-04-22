import type React from 'react';
import {
	useCallback,
	useContext,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react';
import {Internals} from 'remotion';
import type {
	ExpandedFoldersRef,
	ExpandedFoldersState,
} from '../helpers/persist-open-folders';
import {
	ExpandedFoldersContext,
	loadExpandedFolders,
	openFolderKey,
	persistExpandedFolders,
} from '../helpers/persist-open-folders';
import {useSelectComposition} from './InitialCompositionLoader';

export const CompSelectorRef: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {compositions} = useContext(Internals.CompositionManager);
	const [foldersExpanded, setFoldersExpanded] = useState<ExpandedFoldersState>(
		loadExpandedFolders('compositions'),
	);

	const selectComposition = useSelectComposition();

	const toggleFolder = useCallback(
		(folderName: string, parentName: string | null) => {
			setFoldersExpanded((p) => {
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
		[],
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

					setFoldersExpanded((previousState) => {
						const foldersExpandedState: ExpandedFoldersState = {
							...previousState,
						};

						const currentFolder: string | null = folderName;
						const currentParentName: string | null = parentFolderName;
						const key = openFolderKey({
							folderName: currentFolder,
							parentName: currentParentName,
						});

						const splitted = key.split('/');
						for (let i = 0; i < splitted.length - 1; i++) {
							const allExceptLast =
								i === 0
									? openFolderKey({
											folderName: splitted.filter((s) => s !== 'no-parent')[0],
											parentName: null,
										})
									: splitted.slice(0, i + 1).join('/');
							foldersExpandedState[allExceptLast] = true;
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
		[compositions, selectComposition, toggleFolder],
	);

	const contextValue: ExpandedFoldersRef = useMemo(() => {
		return {
			foldersExpanded,
			setFoldersExpanded,
			toggleFolder,
		};
	}, [foldersExpanded, setFoldersExpanded, toggleFolder]);

	return (
		<ExpandedFoldersContext.Provider value={contextValue}>
			{children}
		</ExpandedFoldersContext.Provider>
	);
};
