import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {Internals, TComposition} from 'remotion';
import {
	createFolderTree,
	splitParentIntoNameAndParent,
} from '../helpers/create-folder-tree';
import {
	ExpandedFoldersState,
	loadExpandedFolders,
	openFolderKey,
	persistExpandedFolders,
} from '../helpers/persist-open-folders';
import {loadMarks} from '../state/marks';
import {useZIndex} from '../state/z-index';
import {CompositionSelectorItem} from './CompositionSelectorItem';
import {CurrentComposition} from './CurrentComposition';
import {
	getCurrentCompositionFromUrl,
	getFrameForComposition,
} from './FramePersistor';
import {inOutHandles} from './TimelineInOutToggle';

const container: React.CSSProperties = {
	borderRight: '1px solid black',
	position: 'absolute',
	height: '100%',
	width: '100%',
	flex: 1,
};

const list: React.CSSProperties = {
	padding: 5,
	height: 'calc(100% - 100px)',
	overflowY: 'auto',
};

export const getKeysToExpand = (
	initialFolderName: string,
	parentFolderName: string | null,
	initial: string[] = []
): string[] => {
	initial.push(openFolderKey(initialFolderName, parentFolderName));

	const {name, parent} = splitParentIntoNameAndParent(parentFolderName);
	if (!name) {
		return initial;
	}

	return getKeysToExpand(name, parent, initial);
};

export const CompositionSelector: React.FC = () => {
	const {compositions, setCurrentComposition, currentComposition, folders} =
		useContext(Internals.CompositionManager);
	const [foldersExpanded, setFoldersExpanded] = useState<ExpandedFoldersState>(
		loadExpandedFolders()
	);
	const {tabIndex} = useZIndex();
	const setCurrentFrame = Internals.Timeline.useTimelineSetFrame();

	const selectComposition = useCallback(
		(c: TComposition) => {
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
		},
		[setCurrentComposition, setCurrentFrame]
	);

	const toggleFolder = useCallback(
		(folderName: string, parentName: string | null) => {
			setFoldersExpanded((p) => {
				const key = openFolderKey(folderName, parentName);
				const prev = p[key] ?? false;
				const foldersExpandedState: ExpandedFoldersState = {
					...p,
					[key]: !prev,
				};
				persistExpandedFolders(foldersExpandedState);
				return foldersExpandedState;
			});
		},
		[]
	);

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

	const items = useMemo(() => {
		return createFolderTree(compositions, folders, foldersExpanded);
	}, [compositions, folders, foldersExpanded]);

	return (
		<div style={container}>
			<CurrentComposition />
			<div style={list}>
				{items.map((c) => {
					return (
						<CompositionSelectorItem
							key={c.key + c.type}
							level={0}
							currentComposition={currentComposition}
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
