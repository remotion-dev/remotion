import type React from 'react';
import {useContext, useEffect} from 'react';
import type {AnyComposition} from 'remotion';
import {Internals} from 'remotion';
import type {ExpandedFoldersState} from '../helpers/persist-open-folders';
import {FolderContext} from '../state/folders';
import {getKeysToExpand} from './CompositionSelector';
import {deriveCanvasContentFromUrl} from './ZoomPersistor';

export const useSelectComposition = () => {
	const {setFoldersExpanded} = useContext(FolderContext);
	const {setCanvasContent} = useContext(Internals.CompositionManager);

	return (c: AnyComposition, push: boolean) => {
		if (push) {
			window.history.pushState({}, 'Studio', `/${c.id}`);
		}

		setCanvasContent({type: 'composition', compositionId: c.id});

		const {folderName, parentFolderName} = c;

		if (folderName !== null) {
			setFoldersExpanded((ex) => {
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
				selectComposition(exists, true);
			}
		} else if (canvasContentFromUrl && canvasContentFromUrl.type === 'asset') {
			setCanvasContent(canvasContentFromUrl);
		} else if (compositions.length > 0) {
			selectComposition(compositions[0], true);
		}
	}, [compositions, canvasContent, selectComposition, setCanvasContent]);

	useEffect(() => {
		const onchange = () => {
			const newComp = window.location.pathname.substring(1);
			const exists = compositions.find((c) => c.id === newComp);
			if (exists) {
				selectComposition(exists, false);
			}
		};

		window.addEventListener('popstate', onchange);

		return () => window.removeEventListener('popstate', onchange);
	}, [compositions, selectComposition]);

	return null;
};
