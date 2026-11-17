import {createContext} from 'react';

type MotionBlurVideoRegistration = {
	isPrimarySample: boolean;
	setPrimary: (primary: boolean) => void;
	draw: (canvas: HTMLCanvasElement | null) => void;
};

type MotionBlurVideoCanvas = {
	registrations: Map<string, MotionBlurVideoRegistration>;
	primary: MotionBlurVideoRegistration | null;
	canvas: HTMLCanvasElement | null;
};

export const MotionBlurContext = createContext<{
	sampleIndex: string;
	isPrimarySample: boolean;
	videoCanvases: Map<string, MotionBlurVideoCanvas[]>;
} | null>(null);
