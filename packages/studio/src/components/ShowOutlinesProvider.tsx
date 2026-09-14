import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
	EditorShowOutlinesContext,
	loadEditorShowOutlinesOption,
	persistEditorShowOutlinesOption,
} from '../state/editor-outlines';
import {
	createTimelineSequenceHoverStore,
	TimelineSequenceHoverContext,
} from '../state/timeline-sequence-hover';

const browserStudioPointerLeaveEvent = 'remotion-browser-studio-pointerleave';

export const ShowOutlinesProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [editorShowOutlines, setEditorShowOutlinesState] = useState(() =>
		loadEditorShowOutlinesOption(),
	);
	const timelineSequenceHoverStore = useMemo(
		() => createTimelineSequenceHoverStore(),
		[],
	);
	useEffect(() => {
		const onPointerLeave = () => {
			timelineSequenceHoverStore.setHoveredSequence((hover) =>
				hover?.source === 'timeline' ? null : hover,
			);
		};

		window.addEventListener('pointerleave', onPointerLeave);
		window.addEventListener(browserStudioPointerLeaveEvent, onPointerLeave);
		return () => {
			window.removeEventListener('pointerleave', onPointerLeave);
			window.removeEventListener(
				browserStudioPointerLeaveEvent,
				onPointerLeave,
			);
		};
	}, [timelineSequenceHoverStore]);
	const setEditorShowOutlines = useCallback(
		(newValue: (prevState: boolean) => boolean) => {
			setEditorShowOutlinesState((prevState) => {
				const newVal = newValue(prevState);
				persistEditorShowOutlinesOption(newVal);
				return newVal;
			});
		},
		[],
	);

	const editorShowOutlinesCtx = useMemo(() => {
		return {
			editorShowOutlines,
			setEditorShowOutlines,
		};
	}, [editorShowOutlines, setEditorShowOutlines]);
	return (
		<EditorShowOutlinesContext.Provider value={editorShowOutlinesCtx}>
			<TimelineSequenceHoverContext.Provider value={timelineSequenceHoverStore}>
				{children}
			</TimelineSequenceHoverContext.Provider>
		</EditorShowOutlinesContext.Provider>
	);
};
