import {createContext} from 'react';

export type PreviewSize = 'auto' | number;

type PreviewSizeCtx = {
	size: PreviewSize;
	setSize: (s: PreviewSize) => void;
};

export const PreviewSizeContext = createContext<PreviewSizeCtx>({
	setSize: () => void 0,
	size: 'auto',
});
