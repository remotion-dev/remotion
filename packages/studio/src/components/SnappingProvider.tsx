import React, {useCallback, useMemo, useState} from 'react';
import {
	EditorSnappingContext,
	loadEditorSnappingOption,
	persistEditorSnappingOption,
} from '../state/editor-snapping';

export const SnappingProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [editorSnapping, setEditorSnappingState] = useState(() =>
		loadEditorSnappingOption(),
	);

	const setEditorSnapping = useCallback(
		(newValue: (prevState: boolean) => boolean) => {
			setEditorSnappingState((prevState) => {
				const newVal = newValue(prevState);
				persistEditorSnappingOption(newVal);
				return newVal;
			});
		},
		[],
	);

	const editorSnappingCtx = useMemo(() => {
		return {
			editorSnapping,
			setEditorSnapping,
		};
	}, [editorSnapping, setEditorSnapping]);

	return (
		<EditorSnappingContext.Provider value={editorSnappingCtx}>
			{children}
		</EditorSnappingContext.Provider>
	);
};
