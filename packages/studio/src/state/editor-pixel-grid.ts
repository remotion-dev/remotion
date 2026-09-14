import {createContext} from 'react';

type State = {
	editorShowPixelGrid: boolean;
	setEditorShowPixelGrid: (cb: (prevState: boolean) => boolean) => void;
};

const key = 'remotion.editorShowPixelGrid';

export const persistEditorShowPixelGridOption = (option: boolean) => {
	localStorage.setItem(key, String(option));
};

export const loadEditorShowPixelGridOption = (): boolean => {
	const item = localStorage.getItem(key);
	return item !== 'false';
};

export const EditorShowPixelGridContext = createContext<State>({
	editorShowPixelGrid: true,
	setEditorShowPixelGrid: () => undefined,
});
