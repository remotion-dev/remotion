import {removeATSHVInstructions} from './helpers/remove-a-s-t-curves';
import type {Instruction, ReducedInstruction} from './helpers/types';
import {normalizeInstructions} from './normalize-path';

export const reduceInstructions = (
	instruction: Instruction[]
): ReducedInstruction[] => {
	const simplified = normalizeInstructions(instruction);
	return removeATSHVInstructions(simplified);
};
