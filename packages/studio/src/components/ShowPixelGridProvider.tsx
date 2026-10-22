import React, {useCallback, useMemo, useState} from 'react';
import {
	EditorShowPixelGridContext,
	loadEditorShowPixelGridOption,
	persistEditorShowPixelGridOption,
} from '../state/editor-pixel-grid';

export const ShowPixelGridProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [editorShowPixelGrid, setEditorShowPixelGridState] = useState(() =>
		loadEditorShowPixelGridOption(),
	);
	const setEditorShowPixelGrid = useCallback(
		(newValue: (prevState: boolean) => boolean) => {
			setEditorShowPixelGridState((prevState) => {
				const newVal = newValue(prevState);
				persistEditorShowPixelGridOption(newVal);
				return newVal;
			});
		},
		[],
	);

	const editorShowPixelGridCtx = useMemo(() => {
		return {
			editorShowPixelGrid,
			setEditorShowPixelGrid,
		};
	}, [editorShowPixelGrid, setEditorShowPixelGrid]);

	return (
		<EditorShowPixelGridContext.Provider value={editorShowPixelGridCtx}>
			{children}
		</EditorShowPixelGridContext.Provider>
	);
};
