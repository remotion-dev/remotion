import {createContext} from 'react';

export type Guide = {
	orientation: 'horizontal' | 'vertical';
	position: number;
	show: boolean;
	id: string;
	compositionId: string;
};

export type GuideState = {
	editorShowGuides: boolean;
	setEditorShowGuides: (cb: (prevState: boolean) => boolean) => void;
	guidesList: Guide[];
	setGuidesList: (cb: (prevState: Guide[]) => Guide[]) => void;
	selectedGuideId: string | null;
	setSelectedGuideId: (cb: (prevState: string | null) => string | null) => void;
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

export const EditorShowGuidesContext = createContext<GuideState>({
	editorShowGuides: loadEditorShowGuidesOption(),
	setEditorShowGuides: () => undefined,
	guidesList: [],
	setGuidesList: () => undefined,
	selectedGuideId: null,
	setSelectedGuideId: () => undefined,
	shouldCreateGuideRef: {current: false},
	shouldDeleteGuideRef: {current: false},
});
