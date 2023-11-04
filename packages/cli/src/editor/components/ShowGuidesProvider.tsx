import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
	EditorShowGuidesContext,
	loadEditorShowGuidesOption,
	persistEditorShowGuidesOption,
} from '../state/editor-guides';

export const ShowGuidesProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [guidesList, setGuidesList] = useState<
		{
			orientation: 'horizontal' | 'vertical';
			position: number;
		}[]
	>([]);
	const [selectedGuideIndex, setSelectedGuideIndex] = useState(-1);
	const [editorShowGuides, setEditorShowGuidesState] = useState(() =>
		loadEditorShowGuidesOption(),
	);
	const shouldCreateGuideRef = useRef(false);
	const shouldDeleteGuideRef = useRef(false);

	const setEditorShowGuides = useCallback(
		(newValue: (prevState: boolean) => boolean) => {
			setEditorShowGuidesState((prevState) => {
				const newVal = newValue(prevState);
				persistEditorShowGuidesOption(newVal);
				return newVal;
			});
		},
		[],
	);

	const editorShowGuidesCtx = useMemo(() => {
		return {
			editorShowGuides,
			setEditorShowGuides,
			guidesList,
			setGuidesList,
			selectedGuideIndex,
			setSelectedGuideIndex,
			shouldCreateGuideRef,
			shouldDeleteGuideRef,
		};
	}, [
		editorShowGuides,
		setEditorShowGuides,
		guidesList,
		setGuidesList,
		selectedGuideIndex,
		setSelectedGuideIndex,
		shouldCreateGuideRef,
		shouldDeleteGuideRef,
	]);

	return (
		<EditorShowGuidesContext.Provider value={editorShowGuidesCtx}>
			{children}
		</EditorShowGuidesContext.Provider>
	);
};
