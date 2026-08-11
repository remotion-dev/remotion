import {createContext} from 'react';

type State = {
	editorSnapping: boolean;
	setEditorSnapping: (cb: (prevState: boolean) => boolean) => void;
};

const key = 'remotion.editorSnapping';

export const persistEditorSnappingOption = (option: boolean) => {
	localStorage.setItem(key, String(option));
};

export const loadEditorSnappingOption = (): boolean => {
	const item = localStorage.getItem(key);
	return item !== 'false';
};

export const EditorSnappingContext = createContext<State>({
	editorSnapping: true,
	setEditorSnapping: () => undefined,
});
