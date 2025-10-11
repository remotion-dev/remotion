import React, {useCallback, useMemo, useState} from 'react';
import {
	EditorZoomGesturesContext,
	loadEditorZoomGesturesOption,
	persistEditorZoomGesturesOption,
} from '../state/editor-zoom-gestures';

export const ZoomGesturesProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [editorZoomGestures, setEditorZoomGesturesState] = useState(() =>
		loadEditorZoomGesturesOption(),
	);
	const setEditorZoomGestures = useCallback(
		(newValue: (prevState: boolean) => boolean) => {
			setEditorZoomGesturesState((prevState) => {
				const newVal = newValue(prevState);
				persistEditorZoomGesturesOption(newVal);
				return newVal;
			});
		},
		[],
	);

	const editorZoomGesturesCtx = useMemo(() => {
		return {
			editorZoomGestures,
			setEditorZoomGestures,
		};
	}, [editorZoomGestures, setEditorZoomGestures]);

	return (
		<EditorZoomGesturesContext.Provider value={editorZoomGesturesCtx}>
			{children}
		</EditorZoomGesturesContext.Provider>
	);
};
