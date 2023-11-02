import React, {useCallback, useMemo, useState} from 'react';
import {
	EditorShowGuidesContext,
	loadEditorShowGuidesOption,
	persistEditorShowGuidesOption,
} from '../state/editor-guides';

export const ShowGuidesProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [editorShowGuides, setEditorShowGuidesState] = useState(() =>
		loadEditorShowGuidesOption(),
	);

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
		};
	}, [editorShowGuides, setEditorShowGuides]);

	return (
		<EditorShowGuidesContext.Provider value={editorShowGuidesCtx}>
			{children}
		</EditorShowGuidesContext.Provider>
	);
};
