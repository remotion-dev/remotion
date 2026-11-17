import {createContext} from 'react';

type MotionBlurCanvasRegistration = {
	isPrimarySample: boolean;
	setPrimary: (primary: boolean) => void;
	setHasFrameCallbacks: (hasFrameCallbacks: boolean) => void;
	onVideoFrame: ((frame: CanvasImageSource) => void) | null;
	draw: (canvas: HTMLCanvasElement | null) => void;
};

type MotionBlurCanvas = {
	registrations: Map<string, MotionBlurCanvasRegistration>;
	primary: MotionBlurCanvasRegistration | null;
	canvas: HTMLCanvasElement | null;
	frame: HTMLCanvasElement | null;
};

export type MotionBlurRegistry = {
	canvases: Map<string, MotionBlurCanvas[]>;
	nestedScopes: Map<
		string,
		Array<{registrations: Set<string>; registry: MotionBlurRegistry}>
	>;
};

export const MotionBlurContext = createContext<{
	sampleIndex: string;
	isPrimarySample: boolean;
	registry: MotionBlurRegistry;
} | null>(null);
