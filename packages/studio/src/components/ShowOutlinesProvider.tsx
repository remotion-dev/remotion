import React, {useCallback, useMemo, useState} from 'react';
import {
	EditorShowOutlinesContext,
	loadEditorShowOutlinesOption,
	persistEditorShowOutlinesOption,
} from '../state/editor-outlines';

export const ShowOutlinesProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [editorShowOutlines, setEditorShowOutlinesState] = useState(() =>
		loadEditorShowOutlinesOption(),
	);

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
			{children}
		</EditorShowOutlinesContext.Provider>
	);
};
