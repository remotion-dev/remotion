import {
	COMPOSITION_DRAG_MIME_TYPE,
	parseCompositionDragData,
} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {cmdOrCtrlCharacter} from '../error-overlay/remotion-overlay/ShortcutHint';
import {
	BACKGROUND,
	BLACK_HEX,
	LIGHT_TEXT,
	WHITE_ALPHA_12,
	WHITE_ALPHA_06,
} from '../helpers/colors';
import {createFolderTree} from '../helpers/create-folder-tree';
import {ExpandedFoldersContext} from '../helpers/persist-open-folders';
import {sortItemsByNonceHistory} from '../helpers/sort-by-nonce-history';
import {areKeyboardShortcutsDisabled} from '../helpers/use-keybinding';
import {ModalsContext} from '../state/modals';
import {useZIndex} from '../state/z-index';
import {CompositionSelectorItem} from './CompositionSelectorItem';
import {useSelectComposition} from './InitialCompositionLoader';
import {showNotification} from './Notifications/NotificationCenter';
import {applyCodemod} from './RenderQueue/actions';

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

const quickSwitcherArea: React.CSSProperties = {
	padding: '4px 12px',
	borderBottom: `1px solid ${BLACK_HEX}`,
};

const quickSwitcherTrigger: React.CSSProperties = {
	backgroundColor: WHITE_ALPHA_06,
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
	const [rootDragHovered, setRootDragHovered] = useState(false);

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
			flex: 1,
			overflowY: 'auto',
			backgroundColor: rootDragHovered ? WHITE_ALPHA_12 : BACKGROUND,
		};
	}, [rootDragHovered]);

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

	const clearRootDragHover = useCallback(() => {
		setRootDragHovered(false);
	}, []);

	const onRootDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
		if (
			window.remotion_isReadOnlyStudio ||
			!Array.from(event.dataTransfer.types).includes(COMPOSITION_DRAG_MIME_TYPE)
		) {
			return;
		}

		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
		setRootDragHovered(true);
	}, []);

	const onRootDragLeave = useCallback((event: React.DragEvent<HTMLElement>) => {
		const {relatedTarget} = event;
		if (
			relatedTarget instanceof Node &&
			event.currentTarget.contains(relatedTarget)
		) {
			return;
		}

		setRootDragHovered(false);
	}, []);

	const onRootDrop = useCallback(
		async (event: React.DragEvent<HTMLElement>) => {
			if (window.remotion_isReadOnlyStudio) {
				return;
			}

			const raw = event.dataTransfer.getData(COMPOSITION_DRAG_MIME_TYPE);
			const parsed = raw ? parseCompositionDragData(raw) : null;
			if (parsed === null) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			setRootDragHovered(false);

			const composition = compositions.find(
				(c) => c.id === parsed.compositionId,
			);
			if (!composition || composition.folderName === null) {
				return;
			}

			const notification = showNotification(
				`Moving ${parsed.compositionId}...`,
				null,
			);
			const controller = new AbortController();

			try {
				const result = await applyCodemod({
					codemod: {
						type: 'move-composition-to-folder',
						idToMove: parsed.compositionId,
						folderName: null,
						parentName: null,
					},
					dryRun: false,
					signal: controller.signal,
					symbolicatedStack: null,
				});

				notification.replaceContent(
					result.success
						? `Moved ${parsed.compositionId} to top level`
						: result.reason,
					result.success ? 2000 : 4000,
				);
			} catch (err) {
				notification.replaceContent(
					err instanceof Error ? err.message : String(err),
					4000,
				);
			}
		},
		[compositions],
	);

	return (
		<div style={container}>
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
			<div
				className="__remotion-vertical-scrollbar"
				style={list}
				onDragOver={onRootDragOver}
				onDragLeave={onRootDragLeave}
				onDrop={onRootDrop}
			>
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
							clearRootDragHover={clearRootDragHover}
							tabIndex={tabIndex}
							item={c}
						/>
					);
				})}
			</div>
		</div>
	);
};
