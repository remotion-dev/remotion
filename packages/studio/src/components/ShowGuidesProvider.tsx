import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {Guide, GuideState} from '../state/editor-guides';
import {
	EditorShowGuidesContext,
	loadEditorShowGuidesOption,
	loadGuidesList,
	persistEditorShowGuidesOption,
} from '../state/editor-guides';

export const ShowGuidesProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [guidesList, setGuidesList] = useState<Guide[]>(() => loadGuidesList());
	const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
	const [hoveredGuideId, setHoveredGuideId] = useState<string | null>(null);
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

	const editorShowGuidesCtx = useMemo((): GuideState => {
		return {
			editorShowGuides,
			setEditorShowGuides,
			guidesList,
			setGuidesList,
			selectedGuideId,
			setSelectedGuideId,
			shouldCreateGuideRef,
			shouldDeleteGuideRef,
			hoveredGuideId,
			setHoveredGuideId,
		};
	}, [
		editorShowGuides,
		setEditorShowGuides,
		guidesList,
		selectedGuideId,
		hoveredGuideId,
	]);

	return (
		<EditorShowGuidesContext.Provider value={editorShowGuidesCtx}>
			{children}
		</EditorShowGuidesContext.Provider>
	);
};
