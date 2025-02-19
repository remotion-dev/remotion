import {NoReactInternals} from 'remotion/no-react';

let stillFrame = 0;

export const setStillFrame = (frame: number) => {
	NoReactInternals.validateFrame({
		frame,
		durationInFrames: Infinity,
		allowFloats: false,
	});
	stillFrame = frame;
};

export const getStillFrame = () => stillFrame;
