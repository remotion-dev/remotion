import type React from 'react';
import {useCallback, useContext, useEffect, useRef} from 'react';
import type {_InternalTypes} from 'remotion';
import {Internals} from 'remotion';
import {getKeysToExpand} from '../helpers/create-folder-tree';
import type {ExpandedFoldersState} from '../helpers/persist-open-folders';
import {persistExpandedFolders} from '../helpers/persist-open-folders';
import {
	closedAllCanvasTabsStorageKey,
	getNavigationWindow,
	getRoute,
	pushUrl,
} from '../helpers/url-state';
import {
	CompositionListContext,
	compositionListRenderedRef,
} from '../state/composition-list';
import {FolderContext} from '../state/folders';
import {explorerSidebarTabs} from './ExplorerPanelRef';
import {deriveCanvasContentFromUrl} from './load-canvas-content-from-url';
import {useSelectAsset} from './use-select-asset';
import {useStaticFiles} from './use-static-files';

const pendingCompositionSelectionEvent =
	'remotion-pending-composition-selection';

export const selectCompositionWhenReady = (id: string) => {
	pushUrl(`/${id}`);
	window.dispatchEvent(new Event(pendingCompositionSelectionEvent));
};

export const useSelectComposition = () => {
	const {setCompositionFoldersExpanded} = useContext(FolderContext);
	const {setCanvasContent} = useContext(Internals.CompositionSetters);
	// A supplied frame is explicit navigation (for example, opening a nested
	// composition at its sequence's frame). Plain selection does not seek.
	const seekFrame = Internals.Timeline.useTimelineSeekFrame();

	return useCallback(
		(
			c: Pick<
				_InternalTypes['AnyComposition'],
				'id' | 'folderName' | 'parentFolderName'
			>,
			push: boolean,
			frame: number | null = null,
		) => {
			if (push) {
				pushUrl(`/${c.id}`);
			}

			explorerSidebarTabs.current?.selectCompositionPanel();
			if (frame !== null) {
				seekFrame((current) => ({...current, [c.id]: frame}));
			}

			setCanvasContent({type: 'composition', compositionId: c.id});

			const {folderName, parentFolderName} = c;

			if (folderName !== null) {
				setCompositionFoldersExpanded((ex) => {
					const keysToExpand = getKeysToExpand(folderName, parentFolderName);
					const newState: ExpandedFoldersState = {
						...ex,
					};
					for (const key of keysToExpand) {
						newState[key] = true;
					}

					persistExpandedFolders('compositions', newState);

					return newState;
				});
			}
		},
		[setCanvasContent, setCompositionFoldersExpanded, seekFrame],
	);
};

export const InitialCompositionLoader: React.FC = () => {
	const {compositions, canvasContent} = useContext(
		Internals.CompositionManager,
	);
	const {setCanvasContent} = useContext(Internals.CompositionSetters);
	const {setCompositionListState} = useContext(CompositionListContext);
	const selectComposition = useSelectComposition();
	const selectAsset = useSelectAsset();
	const staticFiles = useStaticFiles();
	const hasShownCanvasContent = useRef(
		(() => {
			try {
				return (
					getRoute() === '/' &&
					sessionStorage.getItem(closedAllCanvasTabsStorageKey) === '1'
				);
			} catch {
				return false;
			}
		})(),
	);

	useEffect(() => {
		const canvasContentFromUrl = deriveCanvasContentFromUrl();
		const seenCompositionIds = window.remotion_seenCompositionIds ?? [];
		const compositionListIsReady =
			compositionListRenderedRef.current &&
			seenCompositionIds.every((id) =>
				compositions.some((composition) => composition.id === id),
			);

		if (canvasContent) {
			hasShownCanvasContent.current = true;
			// If the URL points to a different composition than the one currently
			// displayed, switch to it. This handles the case where the URL is
			// updated externally (e.g. after duplicating a composition).
			if (
				canvasContentFromUrl &&
				canvasContentFromUrl.type === 'composition' &&
				canvasContent.type === 'composition' &&
				canvasContentFromUrl.compositionId !== canvasContent.compositionId
			) {
				const exists = compositions.find(
					(c) => c.id === canvasContentFromUrl.compositionId,
				);
				if (exists) {
					selectComposition(exists, false);
				}
			}

			setCompositionListState('ready');
			return;
		}

		if (canvasContentFromUrl && canvasContentFromUrl.type === 'composition') {
			if (!compositionListIsReady) {
				return;
			}

			const exists = compositions.find(
				(c) => c.id === canvasContentFromUrl.compositionId,
			);
			if (exists) {
				hasShownCanvasContent.current = true;
				selectComposition(exists, false);
				return;
			}

			setCompositionListState('ready');
			return;
		}

		if (canvasContentFromUrl && canvasContentFromUrl.type === 'asset') {
			hasShownCanvasContent.current = true;
			selectAsset(canvasContentFromUrl.asset);
			return;
		}

		if (canvasContentFromUrl && canvasContentFromUrl.type === 'output') {
			hasShownCanvasContent.current = true;
			setCanvasContent(canvasContentFromUrl);
			return;
		}

		if (!compositionListIsReady) {
			return;
		}

		if (
			compositions.length > 0 &&
			!window.remotion_isReadOnlyStudio &&
			!hasShownCanvasContent.current
		) {
			hasShownCanvasContent.current = true;
			selectComposition(compositions[0], true);
		} else {
			setCompositionListState('ready');
		}
	}, [
		compositions,
		canvasContent,
		selectComposition,
		setCanvasContent,
		setCompositionListState,
		selectAsset,
	]);

	useEffect(() => {
		const onchange = () => {
			const newCanvas = deriveCanvasContentFromUrl();
			if (newCanvas && newCanvas.type === 'composition') {
				const exists = compositions.find(
					(c) => c.id === newCanvas.compositionId,
				);
				if (exists) {
					selectComposition(exists, false);
				}

				return;
			}

			if (newCanvas && newCanvas.type === 'asset') {
				const exists = staticFiles.find((file) => {
					return file.name === newCanvas.asset;
				});

				if (exists) {
					selectAsset(newCanvas.asset);
				}

				return;
			}

			setCanvasContent(newCanvas);
		};

		const navigationWindow = getNavigationWindow();
		navigationWindow.addEventListener('popstate', onchange);
		window.addEventListener(pendingCompositionSelectionEvent, onchange);

		return () => {
			navigationWindow.removeEventListener('popstate', onchange);
			window.removeEventListener(pendingCompositionSelectionEvent, onchange);
		};
	}, [
		compositions,
		selectAsset,
		selectComposition,
		setCanvasContent,
		staticFiles,
	]);

	return null;
};
