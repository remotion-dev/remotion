import React, {useCallback, useContext, useEffect} from 'react';
import {Internals, TComposition} from 'remotion';
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
	const {compositions, setCurrentComposition, currentComposition} = useContext(
		Internals.CompositionManager
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
		},
		[setCurrentComposition, setCurrentFrame]
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

	return (
		<div style={container}>
			<CurrentComposition />
			<div style={list}>
				{compositions.map((c) => {
					return (
						<CompositionSelectorItem
							key={c.id}
							currentComposition={currentComposition}
							selectComposition={selectComposition}
							tabIndex={tabIndex}
							composition={c}
						/>
					);
				})}
			</div>
		</div>
	);
};
