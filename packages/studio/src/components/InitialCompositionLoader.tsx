import type React from 'react';
import {useCallback, useContext, useEffect} from 'react';
import type {_InternalTypes} from 'remotion';
import {Internals} from 'remotion';
import {getKeysToExpand} from '../helpers/create-folder-tree';
import {useMobileLayout} from '../helpers/mobile-layout';
import type {ExpandedFoldersState} from '../helpers/persist-open-folders';
import {persistExpandedFolders} from '../helpers/persist-open-folders';
import {getRoute, pushUrl} from '../helpers/url-state';
import {FolderContext} from '../state/folders';
import {SidebarContext} from '../state/sidebar';
import {explorerSidebarTabs} from './ExplorerPanel';
import {deriveCanvasContentFromUrl} from './load-canvas-content-from-url';
import {useStaticFiles} from './use-static-files';

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

export const useSelectComposition = () => {
	const {setCompositionFoldersExpanded} = useContext(FolderContext);
	const {setCanvasContent} = useContext(Internals.CompositionSetters);
	const isMobileLayout = useMobileLayout();
	const {setSidebarCollapsedState} = useContext(SidebarContext);

	return useCallback(
		(c: _InternalTypes['AnyComposition'], push: boolean) => {
			if (push) {
				pushUrl(`/${c.id}`);
			}

			explorerSidebarTabs.current?.selectCompositionPanel();

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
				if (isMobileLayout) {
					setSidebarCollapsedState({left: 'collapsed', right: 'collapsed'});
				}
			}
		},
		[
			isMobileLayout,
			setCanvasContent,
			setCompositionFoldersExpanded,
			setSidebarCollapsedState,
		],
	);
};

export const InitialCompositionLoader: React.FC = () => {
	const {compositions, canvasContent} = useContext(
		Internals.CompositionManager,
	);
	const {setCanvasContent} = useContext(Internals.CompositionSetters);
	const selectComposition = useSelectComposition();
	const selectAsset = useSelectAsset();
	const staticFiles = useStaticFiles();

	useEffect(() => {
		const canvasContentFromUrl = deriveCanvasContentFromUrl();

		if (canvasContent) {
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

			return;
		}

		if (canvasContentFromUrl && canvasContentFromUrl.type === 'composition') {
			const exists = compositions.find(
				(c) => c.id === canvasContentFromUrl.compositionId,
			);
			if (exists) {
				selectComposition(exists, false);
			}

			return;
		}

		if (canvasContentFromUrl && canvasContentFromUrl.type === 'asset') {
			selectAsset(canvasContentFromUrl.asset);
			return;
		}

		if (canvasContentFromUrl && canvasContentFromUrl.type === 'output') {
			setCanvasContent(canvasContentFromUrl);
			return;
		}

		if (compositions.length > 0) {
			selectComposition(compositions[0], true);
		}
	}, [
		compositions,
		canvasContent,
		selectComposition,
		setCanvasContent,
		selectAsset,
	]);

	useEffect(() => {
		const onchange = () => {
			const newCanvas = deriveCanvasContentFromUrl();
			if (newCanvas && newCanvas.type === 'composition') {
				const newComp = getRoute().substring(1);
				const exists = compositions.find((c) => c.id === newComp);
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

		window.addEventListener('popstate', onchange);

		return () => window.removeEventListener('popstate', onchange);
	}, [
		compositions,
		selectAsset,
		selectComposition,
		setCanvasContent,
		staticFiles,
	]);

	return null;
};
