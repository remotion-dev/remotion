import React, {useCallback, useMemo, useState} from 'react';
import {
	EditorShowOutlinesContext,
	loadEditorShowOutlinesOption,
	persistEditorShowOutlinesOption,
} from '../state/editor-outlines';
import {
	TimelineSequenceHoverContext,
	type TimelineSequenceHover,
} from '../state/timeline-sequence-hover';

export const ShowOutlinesProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [editorShowOutlines, setEditorShowOutlinesState] = useState(() =>
		loadEditorShowOutlinesOption(),
	);
	const [hoveredSequence, setHoveredSequence] =
		useState<TimelineSequenceHover | null>(null);

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
	const timelineSequenceHoverCtx = useMemo(
		() => ({hoveredSequence, setHoveredSequence}),
		[hoveredSequence],
	);

	return (
		<EditorShowOutlinesContext.Provider value={editorShowOutlinesCtx}>
			<TimelineSequenceHoverContext.Provider value={timelineSequenceHoverCtx}>
				{children}
			</TimelineSequenceHoverContext.Provider>
		</EditorShowOutlinesContext.Provider>
	);
};
