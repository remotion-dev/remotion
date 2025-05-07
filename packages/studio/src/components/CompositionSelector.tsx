import React, {useCallback, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {BACKGROUND} from '../helpers/colors';
import {
	createFolderTree,
	splitParentIntoNameAndParent,
} from '../helpers/create-folder-tree';
import {
	ExpandedFoldersContext,
	openFolderKey,
} from '../helpers/persist-open-folders';
import {useZIndex} from '../state/z-index';
import {CompositionSelectorItem} from './CompositionSelectorItem';
import {
	CURRENT_COMPOSITION_HEIGHT,
	CurrentComposition,
} from './CurrentComposition';
import {useSelectComposition} from './InitialCompositionLoader';

export const useCompositionNavigation = () => {
	const {compositions, canvasContent} = useContext(
		Internals.CompositionManager,
	);
	const selectComposition = useSelectComposition();

	const navigateToNextComposition = useCallback(() => {
		if (
			!canvasContent ||
			canvasContent.type !== 'composition' ||
			compositions.length <= 1
		) {
			return;
		}

		const currentIndex = compositions.findIndex(
			(c) => c.id === canvasContent.compositionId,
		);
		if (currentIndex === -1) {
			return;
		}

		const nextIndex = (currentIndex + 1) % compositions.length;
		const nextComposition = compositions[nextIndex];
		selectComposition(nextComposition, true);
	}, [canvasContent, compositions, selectComposition]);

	const navigateToPreviousComposition = useCallback(() => {
		if (
			!canvasContent ||
			canvasContent.type !== 'composition' ||
			compositions.length <= 1
		) {
			return;
		}

		const currentIndex = compositions.findIndex(
			(c) => c.id === canvasContent.compositionId,
		);
		if (currentIndex === -1) {
			return;
		}

		const previousIndex =
			(currentIndex - 1 + compositions.length) % compositions.length;
		const previousComposition = compositions[previousIndex];
		selectComposition(previousComposition, true);
	}, [canvasContent, compositions, selectComposition]);

	return useMemo(
		() => ({
			navigateToNextComposition,
			navigateToPreviousComposition,
		}),
		[navigateToNextComposition, navigateToPreviousComposition],
	);
};

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
	overflow: 'hidden',
	backgroundColor: BACKGROUND,
};

export const getKeysToExpand = (
	initialFolderName: string,
	parentFolderName: string | null,
	initial: string[] = [],
): string[] => {
	initial.push(
		openFolderKey({
			folderName: initialFolderName,
			parentName: parentFolderName,
		}),
	);

	const {name, parent} = splitParentIntoNameAndParent(parentFolderName);
	if (!name) {
		return initial;
	}

	return getKeysToExpand(name, parent, initial);
};

export const CompositionSelector: React.FC = () => {
	const {compositions, canvasContent, folders} = useContext(
		Internals.CompositionManager,
	);
	const {foldersExpanded} = useContext(ExpandedFoldersContext);

	const {tabIndex} = useZIndex();
	const selectComposition = useSelectComposition();

	const items = useMemo(() => {
		return createFolderTree(compositions, folders, foldersExpanded);
	}, [compositions, folders, foldersExpanded]);

	const showCurrentComposition =
		canvasContent && canvasContent.type === 'composition';

	const list: React.CSSProperties = useMemo(() => {
		return {
			height: showCurrentComposition
				? `calc(100% - ${CURRENT_COMPOSITION_HEIGHT}px)`
				: '100%',
			overflowY: 'auto',
		};
	}, [showCurrentComposition]);

	const toggleFolder = useCallback(
		(folderName: string, parentName: string | null) => {
			Internals.compositionSelectorRef.current?.toggleFolder(
				folderName,
				parentName,
			);
		},
		[],
	);

	return (
		<div style={container}>
			{showCurrentComposition ? <CurrentComposition /> : null}
			<div className="__remotion-vertical-scrollbar" style={list}>
				{items.map((c) => {
					return (
						<CompositionSelectorItem
							key={c.key + c.type}
							level={0}
							currentComposition={
								showCurrentComposition ? canvasContent.compositionId : null
							}
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
