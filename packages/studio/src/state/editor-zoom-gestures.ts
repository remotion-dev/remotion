import {createContext} from 'react';

type State = {
	editorZoomGestures: boolean;
	setEditorZoomGestures: (cb: (prevState: boolean) => boolean) => void;
};

export const persistEditorZoomGesturesOption = (option: boolean) => {
	localStorage.setItem('remotion.editorZoomGestures', String(option));
};

export const loadEditorZoomGesturesOption = (): boolean => {
	const item = localStorage.getItem('remotion.editorZoomGestures');
	return item !== 'false';
};

export const EditorZoomGesturesContext = createContext<State>({
	editorZoomGestures: loadEditorZoomGesturesOption(),
	setEditorZoomGestures: () => undefined,
});
