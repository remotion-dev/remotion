import {interpolate} from 'remotion';

export const takeOffSpeedFucntion = (f: number) =>
	10 ** interpolate(f, [0, 120], [-1, 4]);

export const remapSpeed = (frame: number, speed: (fr: number) => number) => {
	let framesPassed = 0;
	for (let i = 0; i <= frame; i++) {
		framesPassed += speed(i);
	}

	return framesPassed;
};
