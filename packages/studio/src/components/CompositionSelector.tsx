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
import {
	CURRENT_COMPOSITION_HEIGHT,
	CurrentComposition,
} from './CurrentComposition';
import {useSelectComposition} from './InitialCompositionLoader';

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

export const compositionSelectorRef = createRef<{
	expandComposition: (compName: string) => void;
}>();

export const CompositionSelector: React.FC = () => {
	const {compositions, canvasContent, folders} = useContext(
		Internals.CompositionManager,
	);
	const [foldersExpanded, setFoldersExpanded] = useState<ExpandedFoldersState>(
		loadExpandedFolders('compositions'),
	);
	const {tabIndex} = useZIndex();
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

	useImperativeHandle(compositionSelectorRef, () => {
		return {
			expandComposition: (compName) => {
				const compositionToExpand = compositions.find((c) => c.id === compName);
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
		};
	}, [compositions]);

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
