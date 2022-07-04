import {validateEveryNthFrame} from '../validation/validate-every-nth-frame';

let everyNthFrame = 1;

export const setEveryNthFrame = (frame: number) => {
	validateEveryNthFrame(frame);
	everyNthFrame = frame;
};

export const getEveryNthFrame = () => everyNthFrame;
