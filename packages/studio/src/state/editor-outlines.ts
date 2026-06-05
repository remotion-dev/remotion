import {createContext} from 'react';

type State = {
	editorShowOutlines: boolean;
	setEditorShowOutlines: (cb: (prevState: boolean) => boolean) => void;
};

const key = 'remotion.editorShowOutlines';

export const persistEditorShowOutlinesOption = (option: boolean) => {
	localStorage.setItem(key, String(option));
};

export const loadEditorShowOutlinesOption = (): boolean => {
	const item = localStorage.getItem(key);
	return item !== 'false';
};

export const EditorShowOutlinesContext = createContext<State>({
	editorShowOutlines: true,
	setEditorShowOutlines: () => undefined,
});
