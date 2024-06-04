import type {
	CInstruction,
	LInstruction,
	MInstruction,
	ReducedInstruction,
	ZInstruction,
} from '../helpers/types';

const interpolateLInstruction = (
	t: number,
	first: LInstruction,
	second: LInstruction,
): LInstruction => {
	return {
		type: 'L',
		x: (1 - t) * first.x + t * second.x,
		y: (1 - t) * first.y + t * second.y,
	};
};

const interpolateCInstructions = (
	t: number,
	first: CInstruction,
	second: CInstruction,
): CInstruction => {
	return {
		type: 'C',
		cp1x: (1 - t) * first.cp1x + t * second.cp1x,
		cp2x: (1 - t) * first.cp2x + t * second.cp2x,
		cp1y: (1 - t) * first.cp1y + t * second.cp1y,
		cp2y: (1 - t) * first.cp2y + t * second.cp2y,
		x: (1 - t) * first.x + t * second.x,
		y: (1 - t) * first.y + t * second.y,
	};
};

const interpolateMInstructions = (
	t: number,
	first: MInstruction,
	second: MInstruction,
): MInstruction => {
	return {
		type: 'M',
		x: (1 - t) * first.x + t * second.x,
		y: (1 - t) * first.y + t * second.y,
	};
};

export const interpolateInstructionOfSameKind = (
	t: number,
	first: ReducedInstruction,
	second: ReducedInstruction,
) => {
	if (first.type === 'L') {
		if (second.type !== 'L') {
			throw new Error('mismatch');
		}

		return interpolateLInstruction(t, first, second);
	}

	if (first.type === 'C') {
		if (second.type !== 'C') {
			throw new Error('mismatch');
		}

		return interpolateCInstructions(t, first, second);
	}

	if (first.type === 'M') {
		if (second.type !== 'M') {
			throw new Error('mismatch');
		}

		return interpolateMInstructions(t, first, second);
	}

	if (first.type === 'Z') {
		if (second.type !== 'Z') {
			throw new Error('mismatch');
		}

		return {
			type: 'Z',
		} as ZInstruction;
	}

	throw new Error('mismatch');
};
