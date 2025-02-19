import type {Instruction, Point} from './helpers/types';

export const getEndPosition = (instructions: Instruction[]): Point => {
	let x = 0;
	let y = 0;
	let moveX = 0;
	let moveY = 0;

	for (let i = 0; i < instructions.length; i++) {
		const instruction = instructions[i];
		if (instruction.type === 'M') {
			moveX = instruction.x;
			moveY = instruction.y;
		} else if (instruction.type === 'm') {
			moveX += instruction.dx;
			moveY += instruction.dy;
		}

		if (
			instruction.type === 'A' ||
			instruction.type === 'C' ||
			instruction.type === 'L' ||
			instruction.type === 'M' ||
			instruction.type === 'Q' ||
			instruction.type === 'S' ||
			instruction.type === 'T'
		) {
			x = instruction.x;
			y = instruction.y;
			continue;
		}

		if (
			instruction.type === 'a' ||
			instruction.type === 'c' ||
			instruction.type === 'l' ||
			instruction.type === 'm' ||
			instruction.type === 'q' ||
			instruction.type === 's' ||
			instruction.type === 't'
		) {
			x += instruction.dx;
			y += instruction.dy;
			continue;
		}

		if (instruction.type === 'H') {
			x = instruction.x;
			continue;
		}

		if (instruction.type === 'V') {
			y = instruction.y;
			continue;
		}

		if (instruction.type === 'Z') {
			x = moveX;
			y = moveY;
			continue;
		}

		if (instruction.type === 'h') {
			x += instruction.dx;
			continue;
		}

		if (instruction.type === 'v') {
			y += instruction.dy;
			continue;
		}

		// @ts-expect-error
		throw new Error('Unknown instruction type: ' + instruction.type);
	}

	return {
		x,
		y,
	};
};
