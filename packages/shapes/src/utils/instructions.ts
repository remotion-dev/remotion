import type {Instruction} from '@remotion/paths';

export const serializeInstructions = (instructions: Instruction[]) => {
	return instructions.map((i) => serializeInstruction(i)).join(' ');
};

export const serializeInstruction = (instruction: Instruction) => {
	if (instruction.type === 'M') {
		return `M ${instruction.x} ${instruction.y}`;
	}

	if (instruction.type === 'L') {
		return `L ${instruction.x} ${instruction.y}`;
	}

	if (instruction.type === 'C') {
		return `C ${instruction.cp1x} ${instruction.cp1y} ${instruction.cp2x} ${instruction.cp2y} ${instruction.x} ${instruction.y}`;
	}

	if (instruction.type === 'a') {
		return `a ${instruction.rx} ${instruction.ry} ${
			instruction.xAxisRotation
		} ${Number(instruction.largeArcFlag)} ${Number(
			instruction.sweepFlag ? 1 : 0
		)} ${instruction.x} ${instruction.y}`;
	}

	if (instruction.type === 'A') {
		return `A ${instruction.rx} ${instruction.ry} ${
			instruction.xAxisRotation
		} ${Number(instruction.largeArcFlag)} ${Number(
			instruction.sweepFlag ? 1 : 0
		)} ${instruction.x} ${instruction.y}`;
	}

	if (instruction.type === 'z') {
		return 'z';
	}

	throw new Error('not implemented');
};
