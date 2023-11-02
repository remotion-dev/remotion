import {createContext} from 'react';

type State = {
	editorShowRulers: boolean;
	setEditorShowRulers: (cb: (prevState: boolean) => boolean) => void;
};

export const persistEditorShowRulersOption = (option: boolean) => {
	localStorage.setItem('remotion.editorShowRulers', String(option));
};

export const loadEditorShowRulersOption = (): boolean => {
	const item = localStorage.getItem('remotion.editorShowRulers');
	return item === 'true';
};

export const EditorShowRulersContext = createContext<State>({
	editorShowRulers: loadEditorShowRulersOption(),
	setEditorShowRulers: () => undefined,
});

export const RULER_WIDTH = 20;
export const MINIMUM_VISIBLE_CANVAS_SIZE = 50;
export const PREDEFINED_RULER_SCALE_GAPS = [
	1, 2, 5, 10, 20, 50, 100, 250, 500, 1000, 2000, 5000,
];
export const MAXIMUM_PREDEFINED_RULER_SCALE_GAP = 5000;
export const MINIMUM_RULER_MARKING_GAP_PX = 50;
