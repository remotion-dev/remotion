import React, {useCallback, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {cmdOrCtrlCharacter} from '../error-overlay/remotion-overlay/ShortcutHint';
import {BACKGROUND, BORDER_COLOR, LIGHT_TEXT} from '../helpers/colors';
import {createFolderTree} from '../helpers/create-folder-tree';
import {ExpandedFoldersContext} from '../helpers/persist-open-folders';
import {sortItemsByNonceHistory} from '../helpers/sort-by-nonce-history';
import {areKeyboardShortcutsDisabled} from '../helpers/use-keybinding';
import {ModalsContext} from '../state/modals';
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

const QUICK_SWITCHER_TRIGGER_HEIGHT = 38;

const quickSwitcherArea: React.CSSProperties = {
	padding: '4px 12px',
	borderBottom: `1px solid ${BORDER_COLOR}`,
};

const quickSwitcherTrigger: React.CSSProperties = {
	backgroundColor: 'rgba(255, 255, 255, 0.06)',
	borderRadius: 5,
	padding: '4px 10px',
	color: LIGHT_TEXT,
	fontSize: 12,
	cursor: 'pointer',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	border: 'none',
	width: '100%',
	appearance: 'none',
};

const shortcutLabel: React.CSSProperties = {
	fontSize: 11,
	opacity: 0.6,
};

export const CompositionSelector: React.FC = () => {
	const {compositions, canvasContent, folders} = useContext(
		Internals.CompositionManager,
	);
	const {foldersExpanded} = useContext(ExpandedFoldersContext);
	const {setSelectedModal} = useContext(ModalsContext);

	const {tabIndex} = useZIndex();
	const selectComposition = useSelectComposition();

	const sortedCompositions = useMemo(() => {
		return sortItemsByNonceHistory(compositions);
	}, [compositions]);

	const sortedFolders = useMemo(() => {
		return sortItemsByNonceHistory(folders);
	}, [folders]);

	const items = useMemo(() => {
		return createFolderTree(sortedCompositions, sortedFolders, foldersExpanded);
	}, [sortedCompositions, sortedFolders, foldersExpanded]);

	const list: React.CSSProperties = useMemo(() => {
		return {
			height: `calc(100% - ${CURRENT_COMPOSITION_HEIGHT}px - ${QUICK_SWITCHER_TRIGGER_HEIGHT}px)`,
			overflowY: 'auto',
		};
	}, []);

	const toggleFolder = useCallback(
		(folderName: string, parentName: string | null) => {
			Internals.compositionSelectorRef.current?.toggleFolder(
				folderName,
				parentName,
			);
		},
		[],
	);

	const openQuickSwitcher = useCallback(() => {
		setSelectedModal({
			type: 'quick-switcher',
			mode: 'compositions',
			invocationTimestamp: Date.now(),
		});
	}, [setSelectedModal]);

	return (
		<div style={container}>
			<CurrentComposition />
			<div style={quickSwitcherArea}>
				<button
					type="button"
					style={quickSwitcherTrigger}
					onClick={openQuickSwitcher}
					tabIndex={tabIndex}
				>
					Search...
					{areKeyboardShortcutsDisabled() ? null : (
						<span style={shortcutLabel}>{cmdOrCtrlCharacter}+K</span>
					)}
				</button>
			</div>
			<div className="__remotion-vertical-scrollbar" style={list}>
				{items.map((c) => {
					return (
						<CompositionSelectorItem
							key={c.key + c.type}
							level={0}
							currentComposition={
								canvasContent && canvasContent.type === 'composition'
									? canvasContent.compositionId
									: null
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
