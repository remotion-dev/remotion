import {createContext} from 'react';

type MotionBlurCanvasRegistration = {
	isPrimarySample: boolean;
	setPrimary: (primary: boolean) => void;
	draw: (canvas: HTMLCanvasElement | null) => void;
};

type MotionBlurCanvas = {
	registrations: Map<string, MotionBlurCanvasRegistration>;
	primary: MotionBlurCanvasRegistration | null;
	canvas: HTMLCanvasElement | null;
};

export const MotionBlurContext = createContext<{
	sampleIndex: string;
	isPrimarySample: boolean;
	canvases: Map<string, MotionBlurCanvas[]>;
} | null>(null);
