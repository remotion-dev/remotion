import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {Internals, TComposition} from 'remotion';
import {createFolderTree} from '../helpers/create-folder-tree';
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

export const CompositionSelector: React.FC = () => {
	const {compositions, setCurrentComposition, currentComposition, folders} =
		useContext(Internals.CompositionManager);
	const [foldersExpanded, setFoldersExpanded] = useState<
		Record<string, boolean>
	>({});
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
		},
		[setCurrentComposition, setCurrentFrame]
	);

	const toggleFolder = useCallback((f: string) => {
		setFoldersExpanded((p) => {
			const prev = p[f] ?? false;
			return {
				...p,
				[f]: !prev,
			};
		});
	}, []);

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
