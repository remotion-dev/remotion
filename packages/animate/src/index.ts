import React from 'react';
import {Easing, interpolate} from 'remotion';

type Instruction = {
	type: 'move';
	x: number;
	y: number;
};

type AnimationState = {
	frame: number;
	fps: number;
	instructions: Instruction[];
	properties: Record<string, unknown>;
};

type AnimatedCss = React.CSSProperties & {
	move: (x: number, y: number) => AnimatedCss;
	for: (duration: number) => AnimatedCss;
};

export const continueAnimation = (state: AnimationState): AnimatedCss => {
	const move = (x: number, y: number) => {
		const newState: AnimationState = {
			...state,
			instructions: [...state.instructions, {type: 'move', x, y}],
		};

		return continueAnimation(newState);
	};

	const jsFor = (duration: number) => {
		const progress = interpolate(state.frame, [0, duration], [0, 1], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.inOut(Easing.ease),
		});
		const newState: AnimationState = {
			...state,
			instructions: [],
		};
		for (const instruction of state.instructions) {
			if (instruction.type === 'move') {
				newState.properties.transform = `translate(${instruction.x * progress}px, ${instruction.y * progress}px)`;
			}
		}

		return continueAnimation(state);
	};

	const returnValue: AnimatedCss = {
		...state.properties,
		move,
		for: jsFor,
	};

	return returnValue;
};

export const animate = (frame: number, fps: number) => {
	const instructions: Instruction[] = [];
	const properties: Record<string, unknown> = {};

	return continueAnimation({fps, frame, instructions, properties});
};

const frame = 15;
const fps = 30;

const val = animate(frame, fps).move(100, 100).for(20);
console.log(val);
