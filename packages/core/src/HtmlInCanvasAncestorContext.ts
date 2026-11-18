import {createContext} from 'react';

export type HtmlInCanvasPaintState = {
	pendingChildren: number;
	generation: number;
	release: (() => void) | null;
	blockPaint: () => () => void;
};

export const HtmlInCanvasAncestorContext =
	createContext<HtmlInCanvasPaintState | null>(null);
