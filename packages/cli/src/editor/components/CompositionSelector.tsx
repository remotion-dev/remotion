import React, {useCallback, useContext, useMemo, useState} from 'react';
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
	borderRight: '1px solid black',
	position: 'absolute',
	height: '100%',
	width: '100%',
	flex: 1,
	backgroundColor: BACKGROUND,
};

const list: React.CSSProperties = {
	padding: 5,
	height: 'calc(100% - 100px)',
	overflowY: 'auto',
};

export const getKeysToExpand = (
	initialFolderName: string,
	parentFolderName: string | null,
	initial: string[] = []
): string[] => {
	initial.push(openFolderKey(initialFolderName, parentFolderName));

	const {name, parent} = splitParentIntoNameAndParent(parentFolderName);
	if (!name) {
		return initial;
	}

	return getKeysToExpand(name, parent, initial);
};

export const CompositionSelector: React.FC = () => {
	const {compositions, currentComposition, folders} = useContext(
		Internals.CompositionManager
	);
	const [foldersExpanded, setFoldersExpanded] = useState<ExpandedFoldersState>(
		loadExpandedFolders()
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
		[]
	);

	const items = useMemo(() => {
		return createFolderTree(compositions, folders, foldersExpanded);
	}, [compositions, folders, foldersExpanded]);

	return (
		<div style={container}>
			<CurrentComposition />
			<div style={list}>
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
