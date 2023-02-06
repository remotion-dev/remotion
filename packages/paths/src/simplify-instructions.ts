import {removeATSHVInstructions} from './helpers/remove-a-s-t-curves';
import type {AbsoluteInstruction, Instruction} from './helpers/types';
import {normalizePath} from './normalize-path';
import {parsePath} from './parse-path';
import {serializeInstructions} from './serialize-instructions';

export const simplifyInstructions = (instruction: Instruction[]) => {
	const serialized = serializeInstructions(instruction);
	const simplified = normalizePath(serialized);
	const parsed = parsePath(simplified) as AbsoluteInstruction[];
	return removeATSHVInstructions(parsed);
};
