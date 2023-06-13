import type React from 'react';
import {useContext, useEffect} from 'react';
import type {AnyComposition} from 'remotion';
import {Internals} from 'remotion';
import type {ExpandedFoldersState} from '../helpers/persist-open-folders';
import {FolderContext} from '../state/folders';
import {loadMarks} from '../state/marks';
import {TimelineZoomCtx} from '../state/timeline-zoom';
import {getKeysToExpand} from './CompositionSelector';
import {
	getCurrentCompositionFromUrl,
	getFrameForComposition,
} from './FramePersistor';
import {ensureFrameIsInViewport} from './Timeline/timeline-scroll-logic';
import {inOutHandles} from './TimelineInOutToggle';
import {getZoomForComposition} from './ZoomPersistor';

export const useSelectComposition = () => {
	const setCurrentFrame = Internals.Timeline.useTimelineSetFrame();
	const {setCurrentComposition} = useContext(Internals.CompositionManager);
	const {setFoldersExpanded} = useContext(FolderContext);
	const {setZoom} = useContext(TimelineZoomCtx);
	return (c: AnyComposition, push: boolean) => {
		inOutHandles.current?.setMarks(loadMarks(c.id, c.durationInFrames));
		if (push) {
			window.history.pushState({}, 'Studio', `/${c.id}`);
		}

		const frame = getFrameForComposition(c.id);
		const zoom = getZoomForComposition(c.id);
		const frameInBounds = Math.min(c.durationInFrames - 1, frame);
		setCurrentFrame(frameInBounds);
		setCurrentComposition(c.id);
		setZoom(() => zoom);
		setTimeout(() => {
			ensureFrameIsInViewport({
				direction: 'center',
				frame,
				durationInFrames: c.durationInFrames,
			});
		});
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
				selectComposition(exists, true);
				return;
			}
		}

		if (compositions.length > 0) {
			selectComposition(compositions[0], true);
		}
	}, [compositions, currentComposition, selectComposition]);

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
