import {Internals} from 'remotion';

let stillFrame = 0;

export const setStillFrame = (frame: number) => {
	Internals.validateFrame(frame, Infinity);
	stillFrame = frame;
};

export const getStillFrame = () => stillFrame;
