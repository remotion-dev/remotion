import {validateFrame} from '../validation/validate-frame';

let everyNthFrame = 0;

export const setEveryNthFrame = (frame: number) => {
	validateFrame(frame, Infinity);
	everyNthFrame = frame;
};

export const getEveryNthFrame = () => everyNthFrame;
