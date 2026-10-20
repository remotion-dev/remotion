import {Easing, interpolate, spring} from 'remotion';

export const FPS = 30;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

const clamp = {
	extrapolateLeft: 'clamp',
	extrapolateRight: 'clamp',
} as const;

// Bouncy entrance, 0 -> 1 (slightly overshooting).
export const pop = (frame: number, delay = 0, damping = 12) =>
	spring({
		frame: frame - delay,
		fps: FPS,
		config: {damping, stiffness: 180, mass: 0.7},
	});

// Smooth entrance without overshoot, 0 -> 1.
export const rise = (frame: number, delay = 0, duration = 18) =>
	interpolate(frame, [delay, delay + duration], [0, 1], {
		...clamp,
		easing: easeOut,
	});

// 1 -> 0 over the last `duration` frames before `end`.
export const exit = (frame: number, end: number, duration = 10) =>
	interpolate(frame, [end - duration, end], [1, 0], {
		...clamp,
		easing: Easing.bezier(0.7, 0, 0.84, 0),
	});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Number of characters of `text` revealed by a typewriter starting at `delay`.
export const typed = (
	frame: number,
	text: string,
	delay = 0,
	charsPerFrame = 1.2,
) => text.slice(0, Math.max(0, Math.floor((frame - delay) * charsPerFrame)));
