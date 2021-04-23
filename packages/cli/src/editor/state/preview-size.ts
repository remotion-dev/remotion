import {createContext} from 'react';

export type PreviewSize = 'auto' | number;

type PreviewSizeCtx = {
	size: PreviewSize;
	setSize: React.Dispatch<React.SetStateAction<PreviewSize>>;
};

export const persistPreviewSizeOption = (option: PreviewSize) => {
	localStorage.setItem('previewSize', String(option));
};

export const loadPreviewSizeOption = (): PreviewSize => {
	const item = localStorage.getItem('previewSize');
	if (item === null) return 'auto';
	else return item as PreviewSize;
};

export const PreviewSizeContext = createContext<PreviewSizeCtx>({
	setSize: () => void 0,
	size: loadPreviewSizeOption(),
});
