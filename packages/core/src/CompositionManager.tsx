import {createContext} from 'react';

export type TComposition = {
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	name: string;
	component: React.FC<any>;
};

type CompositionManagerContext = {
	compositions: TComposition[];
	registerComposition: (comp: TComposition) => void;
	unregisterComposition: (name: string) => void;
};

export const CompositionManager = createContext<CompositionManagerContext>({
	compositions: [],
	registerComposition: () => void 0,
	unregisterComposition: () => void 0,
});
