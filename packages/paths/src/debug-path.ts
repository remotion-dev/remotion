import type {Instruction} from './helpers/types';
import {normalizeInstructions} from './normalize-path';
import {parsePath} from './parse-path';
import {serializeInstructions} from './serialize-instructions';

type DebugInstruction = {
	d: string;
	color: string;
};

export const debugPath = (d: string) => {
	const instructions = normalizeInstructions(parsePath(d));

	return instructions
		.map((inst, i): DebugInstruction | null => {
			if (inst.type === 'Z') {
				return null;
			}

			if (inst.type === 'H' || inst.type === 'V') {
				return null;
			}

			const topLeft = [inst.x - 5, inst.y - 5];
			const topRight = [inst.x + 5, inst.y - 5];
			const bottomLeft = [inst.x - 5, inst.y + 5];
			const bottomRight = [inst.x + 5, inst.y + 5];

			const triangle: Instruction[] = [
				{
					type: 'M',
					x: topLeft[0],
					y: topLeft[1],
				},
				{
					type: 'L',
					x: topRight[0],
					y: topRight[1],
				},
				{
					type: 'L',
					x: bottomRight[0],
					y: bottomRight[1],
				},
				{
					type: 'L',
					x: bottomLeft[0],
					y: bottomLeft[1],
				},
				{
					type: 'Z',
				},
			];

			return {
				d: serializeInstructions(triangle),
				color:
					i === instructions.length - 1
						? 'red'
						: inst.type === 'M'
							? 'blue'
							: 'green',
			};
		})
		.filter(Boolean) as DebugInstruction[];
};
