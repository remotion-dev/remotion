import React, {useContext, useEffect} from 'react';
import {Internals, TComposition} from 'remotion';
import {ExpandedFoldersState} from '../helpers/persist-open-folders';
import {FolderContext} from '../state/folders';
import {loadMarks} from '../state/marks';
import {getKeysToExpand} from './CompositionSelector';
import {
	getCurrentCompositionFromUrl,
	getFrameForComposition,
} from './FramePersistor';
import {inOutHandles} from './TimelineInOutToggle';

export const useSelectComposition = () => {
	const setCurrentFrame = Internals.Timeline.useTimelineSetFrame();
	const {setCurrentComposition} = useContext(Internals.CompositionManager);
	const {setFoldersExpanded} = useContext(FolderContext);
	return (c: TComposition) => {
		inOutHandles.current?.setMarks(loadMarks(c.id, c.durationInFrames));
		window.history.pushState({}, 'Preview', `/${c.id}`);
		const frame = getFrameForComposition(c.id);
		const frameInBounds = Math.min(c.durationInFrames - 1, frame);
		setCurrentFrame(frameInBounds);
		setCurrentComposition(c.id);
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
	const {compositions, currentComposition} = useContext(
		Internals.CompositionManager
	);
	const selectComposition = useSelectComposition();

	useEffect(() => {
		if (currentComposition) {
			return;
		}

		const compositionFromUrl = getCurrentCompositionFromUrl();
		if (compositionFromUrl) {
			const exists = compositions.find((c) => c.id === compositionFromUrl);
			if (exists) {
				selectComposition(exists);
				return;
			}
		}

		if (compositions.length > 0) {
			selectComposition(compositions[0]);
		}
	}, [compositions, currentComposition, selectComposition]);

	return null;
};
