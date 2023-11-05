import {createContext} from 'react';

type State = {
	editorShowGuides: boolean;
	setEditorShowGuides: (cb: (prevState: boolean) => boolean) => void;
	guidesList: {
		orientation: 'horizontal' | 'vertical';
		position: number;
		show: boolean;
	}[];
	setGuidesList: (
		cb: (
			prevState: {
				orientation: 'horizontal' | 'vertical';
				position: number;
				show: boolean;
			}[],
		) => {
			orientation: 'horizontal' | 'vertical';
			position: number;
			show: boolean;
		}[],
	) => void;
	selectedGuideIndex: number;
	setSelectedGuideIndex: (cb: (prevState: number) => number) => void;
	shouldCreateGuideRef: React.MutableRefObject<boolean>;
	shouldDeleteGuideRef: React.MutableRefObject<boolean>;
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
	guidesList: [],
	setGuidesList: () => undefined,
	selectedGuideIndex: -1,
	setSelectedGuideIndex: () => undefined,
	shouldCreateGuideRef: {current: false},
	shouldDeleteGuideRef: {current: false},
});
