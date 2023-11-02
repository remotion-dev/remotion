import {createContext} from 'react';

type State = {
	editorShowGuides: boolean;
	setEditorShowGuides: (cb: (prevState: boolean) => boolean) => void;
};

export const persistEditorShowGuidesOption = (option: boolean) => {
	localStorage.setItem('remotion.editorShowGuides', String(option));
};

export const loadEditorShowGuidesOption = (): boolean => {
	const item = localStorage.getItem('remotion.editorShowGuides');
	return item === 'true';
};

export const EditorShowGuidesContext = createContext<State>({
	editorShowGuides: loadEditorShowGuidesOption(),
	setEditorShowGuides: () => undefined,
});
