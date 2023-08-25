import React, {
	createRef,
	useCallback,
	useContext,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {BACKGROUND} from '../helpers/colors';
import {
	createFolderTree,
	splitParentIntoNameAndParent,
} from '../helpers/create-folder-tree';
import type {ExpandedFoldersState} from '../helpers/persist-open-folders';
import {
	loadExpandedFolders,
	openFolderKey,
	persistExpandedFolders,
} from '../helpers/persist-open-folders';
import {useZIndex} from '../state/z-index';
import {CompositionSelectorItem} from './CompositionSelectorItem';
import {CurrentComposition} from './CurrentComposition';
import {useSelectComposition} from './InitialCompositionLoader';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
	overflow: 'hidden',
	backgroundColor: BACKGROUND,
};

const list: React.CSSProperties = {
	height: 'calc(100% - 80px)',
	overflowY: 'auto',
};

export const getKeysToExpand = (
	initialFolderName: string,
	parentFolderName: string | null,
	initial: string[] = [],
): string[] => {
	initial.push(openFolderKey(initialFolderName, parentFolderName));

	const {name, parent} = splitParentIntoNameAndParent(parentFolderName);
	if (!name) {
		return initial;
	}

	return getKeysToExpand(name, parent, initial);
};

export const compositionSelectorRef = createRef<{
	expandComposition: (compName: string) => void;
}>();

export const CompositionSelector: React.FC = () => {
	const {compositions, currentComposition, folders} = useContext(
		Internals.CompositionManager,
	);
	const [foldersExpanded, setFoldersExpanded] = useState<ExpandedFoldersState>(
		loadExpandedFolders(),
	);
	const {tabIndex} = useZIndex();
	const selectComposition = useSelectComposition();

	const toggleFolder = useCallback(
		(folderName: string, parentName: string | null) => {
			setFoldersExpanded((p) => {
				const key = openFolderKey(folderName, parentName);
				const prev = p[key] ?? false;
				const foldersExpandedState: ExpandedFoldersState = {
					...p,
					[key]: !prev,
				};
				persistExpandedFolders(foldersExpandedState);
				return foldersExpandedState;
			});
		},
		[],
	);

	useImperativeHandle(
		compositionSelectorRef,
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

						let currentFolder: string | null = folderName;
						let currentParentName: string | null = parentFolderName;

						while (currentFolder) {
							if (currentParentName?.includes('/')) {
								const splittedParentName = currentParentName.split('/');
								currentParentName = splittedParentName.pop() ?? null;
							}

							const key = openFolderKey(currentFolder, currentParentName);
							foldersExpandedState[key] = true;

							const parentFolder = folders.find((f) => {
								return f.name === currentParentName && currentParentName;
							});
							currentFolder = parentFolder?.name ?? null;
							currentParentName = parentFolder?.parent ?? null;
						}

						persistExpandedFolders(foldersExpandedState);

						return foldersExpandedState;
					});
				},
			};
		},
		[compositions, folders],
	);

	const items = useMemo(() => {
		return createFolderTree(compositions, folders, foldersExpanded);
	}, [compositions, folders, foldersExpanded]);

	return (
		<div style={container}>
			<CurrentComposition />
			<div className="__remotion-vertical-scrollbar" style={list}>
				{items.map((c) => {
					return (
						<CompositionSelectorItem
							key={c.key + c.type}
							level={0}
							currentComposition={currentComposition}
							selectComposition={selectComposition}
							toggleFolder={toggleFolder}
							tabIndex={tabIndex}
							item={c}
						/>
					);
				})}
			</div>
		</div>
	);
};
