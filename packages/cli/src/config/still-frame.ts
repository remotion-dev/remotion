import {RenderInternals} from '@remotion/renderer';

let stillFrame = 0;

export const setStillFrame = (frame: number) => {
	RenderInternals.validateFrame(frame, Infinity);
	stillFrame = frame;
};

export const getStillFrame = () => stillFrame;
