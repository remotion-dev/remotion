import {validateFrame} from '../validation/validate-frame';

let stillFrame = 0;

export const setStillFrame = (frame: number) => {
	validateFrame(frame, Infinity);
	stillFrame = frame;
};

export const getStillFrame = () => stillFrame;
