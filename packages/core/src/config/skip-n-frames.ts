import {validateFrame} from '../validation/validate-frame';

let skipNFrames = 0;

export const setSkipNFrames = (frame: number) => {
	validateFrame(frame, Infinity);
	skipNFrames = frame;
};

export const getSkipNFrames = () => skipNFrames;
