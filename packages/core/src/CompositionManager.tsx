import {ComponentType, createContext} from 'react';

export type TComposition<T = unknown> = {
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	name: string;
	component: ComponentType<T>;
	props?: T;
};

export type CompositionManagerContext = {
	compositions: TComposition[];
	registerComposition: <T>(comp: TComposition<T>) => void;
	unregisterComposition: (name: string) => void;
	currentComposition: string | null;
	setCurrentComposition: (curr: string) => void;
};

export const CompositionManager = createContext<CompositionManagerContext>({
	compositions: [],
	registerComposition: () => void 0,
	unregisterComposition: () => void 0,
	currentComposition: null,
	setCurrentComposition: () => void 0,
});
