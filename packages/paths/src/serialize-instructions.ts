import type {Instruction} from './helpers/types';

/**
 * @description Takes an array of Instruction's and serializes it into an SVG path string.
 * @param {Array} instruction
 * @returns a serialized SVG path string
 * @see [Documentation](https://www.remotion.dev/docs/paths/serialize-instructions)
 */
const serializeInstruction = (instruction: Instruction): string => {
	if (instruction.type === 'A') {
		return `A ${instruction.rx} ${instruction.ry} ${
			instruction.xAxisRotation
		} ${Number(instruction.largeArcFlag)} ${Number(instruction.sweepFlag)} ${
			instruction.x
		} ${instruction.y}`;
	}

	if (instruction.type === 'a') {
		return `a ${instruction.rx} ${instruction.ry} ${
			instruction.xAxisRotation
		} ${Number(instruction.largeArcFlag)} ${Number(instruction.sweepFlag)} ${
			instruction.dx
		} ${instruction.dy}`;
	}

	if (instruction.type === 'C') {
		return `C ${instruction.cp1x} ${instruction.cp1y} ${instruction.cp2x} ${instruction.cp2y} ${instruction.x} ${instruction.y}`;
	}

	if (instruction.type === 'c') {
		return `c ${instruction.cp1dx} ${instruction.cp1dy} ${instruction.cp2dx} ${instruction.cp2dy} ${instruction.dx} ${instruction.dy}`;
	}

	if (instruction.type === 'S') {
		return `S ${instruction.cpx} ${instruction.cpy} ${instruction.x} ${instruction.y}`;
	}

	if (instruction.type === 's') {
		return `s ${instruction.cpdx} ${instruction.cpdy} ${instruction.dx} ${instruction.dy}`;
	}

	if (instruction.type === 'Q') {
		return `Q ${instruction.cpx} ${instruction.cpy} ${instruction.x} ${instruction.y}`;
	}

	if (instruction.type === 'q') {
		return `q ${instruction.cpdx} ${instruction.cpdy} ${instruction.dx} ${instruction.dy}`;
	}

	if (instruction.type === 'Z') {
		return 'Z';
	}

	if (instruction.type === 'H') {
		return `H ${instruction.x}`;
	}

	if (instruction.type === 'h') {
		return `h ${instruction.dx}`;
	}

	if (instruction.type === 'V') {
		return `V ${instruction.y}`;
	}

	if (instruction.type === 'v') {
		return `v ${instruction.dy}`;
	}

	if (instruction.type === 'L') {
		return `L ${instruction.x} ${instruction.y}`;
	}

	if (instruction.type === 'l') {
		return `l ${instruction.dx} ${instruction.dy}`;
	}

	if (instruction.type === 'M') {
		return `M ${instruction.x} ${instruction.y}`;
	}

	if (instruction.type === 'm') {
		return `m ${instruction.dx} ${instruction.dy}`;
	}

	if (instruction.type === 'T') {
		return `T ${instruction.x} ${instruction.y}`;
	}

	if (instruction.type === 't') {
		return `t ${instruction.dx} ${instruction.dy}`;
	}

	// @ts-expect-error
	throw new Error(`Unknown instruction type: ${instruction.type}`);
};

export const serializeInstructions = (path: Instruction[]): string => {
	return path
		.map((p) => {
			return serializeInstruction(p);
		})
		.join(' ');
};
