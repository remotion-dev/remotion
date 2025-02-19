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
	setHoveredGuideId: (cb: (prevState: string | null) => string | null) => void;
	hoveredGuideId: string | null;
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

export const persistGuidesList = (guides: Guide[]) => {
	localStorage.setItem('remotion.guidesList', JSON.stringify(guides));
};

export const loadGuidesList = (): Guide[] => {
	const item = localStorage.getItem('remotion.guidesList');
	return item ? JSON.parse(item) : [];
};

export const EditorShowGuidesContext = createContext<GuideState>({
	editorShowGuides: false,
	setEditorShowGuides: () => undefined,
	guidesList: [],
	setGuidesList: () => undefined,
	selectedGuideId: null,
	setSelectedGuideId: () => undefined,
	shouldCreateGuideRef: {current: false},
	shouldDeleteGuideRef: {current: false},
	hoveredGuideId: null,
	setHoveredGuideId: () => undefined,
});
