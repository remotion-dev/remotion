import React, {
	useCallback,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {Guide, GuideState} from '../state/editor-guides';
import {
	EditorShowGuidesContext,
	EditorShowGuidesRefContext,
	loadEditorShowGuidesOption,
	loadGuidesList,
	persistEditorShowGuidesOption,
} from '../state/editor-guides';

export const ShowGuidesProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [guidesList, setGuidesListState] = useState<Guide[]>(() =>
		loadGuidesList(),
	);
	const guidesListRef = useRef(guidesList);
	const setGuidesList = useCallback((update: (guides: Guide[]) => Guide[]) => {
		const next = update(guidesListRef.current);
		guidesListRef.current = next;
		setGuidesListState(next);
	}, []);
	const [draggingGuideId, setDraggingGuideId] = useState<string | null>(null);
	const moveGuidePointerRef = useRef<((event: PointerEvent) => void) | null>(
		null,
	);
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
			guidesListRef,
			setGuidesList,
			draggingGuideId,
			moveGuidePointerRef,
			setDraggingGuideId,
			shouldCreateGuideRef,
			shouldDeleteGuideRef,
			hoveredGuideId,
			setHoveredGuideId,
		};
	}, [
		editorShowGuides,
		setEditorShowGuides,
		guidesList,
		setGuidesList,
		draggingGuideId,
		hoveredGuideId,
	]);
	const guideStateRef = useRef(editorShowGuidesCtx);
	useLayoutEffect(() => {
		guideStateRef.current = editorShowGuidesCtx;
	}, [editorShowGuidesCtx]);

	return (
		<EditorShowGuidesRefContext.Provider value={guideStateRef}>
			<EditorShowGuidesContext.Provider value={editorShowGuidesCtx}>
				{children}
			</EditorShowGuidesContext.Provider>
		</EditorShowGuidesRefContext.Provider>
	);
};
