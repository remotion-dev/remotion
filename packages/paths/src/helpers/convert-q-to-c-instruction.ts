import type {CInstruction, Point, QInstruction} from './types';

export const convertQToCInstruction = (
	instruction: QInstruction,
	startPoint: Point,
): CInstruction => {
	const cp1x = startPoint.x + (2 / 3) * (instruction.cpx - startPoint.x);
	const cp1y = startPoint.y + (2 / 3) * (instruction.cpy - startPoint.y);

	const cp2x = instruction.x + (2 / 3) * (instruction.cpx - instruction.x);
	const cp2y = instruction.y + (2 / 3) * (instruction.cpy - instruction.y);

	return {
		type: 'C',
		cp1x,
		cp1y,
		cp2x,
		cp2y,
		x: instruction.x,
		y: instruction.y,
	};
};
