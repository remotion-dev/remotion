import type React from 'react';
import {useContext, useEffect} from 'react';
import type {AnyComposition} from 'remotion';
import {getStaticFiles, Internals} from 'remotion';
import type {ExpandedFoldersState} from '../../../../studio/src/helpers/persist-open-folders';
import {FolderContext} from '../state/folders';
import {getKeysToExpand} from './CompositionSelector';
import {deriveCanvasContentFromUrl} from './ZoomPersistor';

const useSelectAsset = () => {
	const {setCanvasContent} = useContext(Internals.CompositionManager);
	const {setAssetFoldersExpanded} = useContext(FolderContext);

	return (asset: string) => {
		setCanvasContent({type: 'asset', asset});
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
	};
};

export const useSelectComposition = () => {
	const {setCompositionFoldersExpanded} = useContext(FolderContext);
	const {setCanvasContent} = useContext(Internals.CompositionManager);

	return (c: AnyComposition, push: boolean) => {
		if (push) {
			window.history.pushState({}, 'Studio', `/${c.id}`);
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

				return newState;
			});
		}
	};
};

export const InitialCompositionLoader: React.FC = () => {
	const {compositions, canvasContent, setCanvasContent} = useContext(
		Internals.CompositionManager,
	);
	const selectComposition = useSelectComposition();
	const selectAsset = useSelectAsset();

	useEffect(() => {
		if (canvasContent) {
			return;
		}

		const canvasContentFromUrl = deriveCanvasContentFromUrl();
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
				const newComp = window.location.pathname.substring(1);
				const exists = compositions.find((c) => c.id === newComp);
				if (exists) {
					selectComposition(exists, false);
				}

				return;
			}

			if (newCanvas && newCanvas.type === 'asset') {
				const staticFiles = getStaticFiles();
				const exists = staticFiles.find((file) => {
					return file.name === newCanvas.asset;
				});

				if (exists) {
					setCanvasContent(newCanvas);
				}

				return;
			}

			setCanvasContent(newCanvas);
		};

		window.addEventListener('popstate', onchange);

		return () => window.removeEventListener('popstate', onchange);
	}, [compositions, selectComposition, setCanvasContent]);

	return null;
};
