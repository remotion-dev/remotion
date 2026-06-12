import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useKeybinding} from '../helpers/use-keybinding';
import type {Guide, GuideState} from '../state/editor-guides';
import {
	EditorShowGuidesContext,
	loadEditorShowGuidesOption,
	loadGuidesList,
	persistEditorShowGuidesOption,
	persistGuidesList,
} from '../state/editor-guides';

export const ShowGuidesProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [guidesList, setGuidesList] = useState<Guide[]>(() => loadGuidesList());
	const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
	const [draggingGuideId, setDraggingGuideId] = useState<string | null>(null);
	const [hoveredGuideId, setHoveredGuideId] = useState<string | null>(null);
	const [editorShowGuides, setEditorShowGuidesState] = useState(() =>
		loadEditorShowGuidesOption(),
	);
	const shouldCreateGuideRef = useRef(false);
	const shouldDeleteGuideRef = useRef(false);
	const keybindings = useKeybinding();

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

	useEffect(() => {
		if (
			selectedGuideId === null ||
			guidesList.some((guide) => guide.id === selectedGuideId)
		) {
			return;
		}

		setSelectedGuideId(() => null);
	}, [guidesList, selectedGuideId]);

	useEffect(() => {
		if (selectedGuideId === null) {
			return;
		}

		const removeSelectedGuide = () => {
			setGuidesList((prevState) => {
				const newGuides = prevState.filter((guide) => {
					return guide.id !== selectedGuideId;
				});
				persistGuidesList(newGuides);
				return newGuides;
			});
			setSelectedGuideId(() => null);
			setDraggingGuideId(() => null);
		};

		const backspace = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'Backspace',
			callback: removeSelectedGuide,
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const deleteKey = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'Delete',
			callback: removeSelectedGuide,
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			backspace.unregister();
			deleteKey.unregister();
		};
	}, [keybindings, selectedGuideId]);

	const editorShowGuidesCtx = useMemo((): GuideState => {
		return {
			editorShowGuides,
			setEditorShowGuides,
			guidesList,
			setGuidesList,
			selectedGuideId,
			setSelectedGuideId,
			draggingGuideId,
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
		selectedGuideId,
		draggingGuideId,
		hoveredGuideId,
	]);

	return (
		<EditorShowGuidesContext.Provider value={editorShowGuidesCtx}>
			{children}
		</EditorShowGuidesContext.Provider>
	);
};
