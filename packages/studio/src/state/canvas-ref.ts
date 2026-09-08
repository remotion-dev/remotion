import {createContext, createRef} from 'react';

export const canvasRef = createRef<HTMLDivElement>();
export const drawRef = createRef<HTMLDivElement>();

export const RefreshCanvasSizeContext = createContext<(() => void) | null>(
	null,
);
