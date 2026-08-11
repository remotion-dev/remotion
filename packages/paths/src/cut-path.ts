import {cutInstruction} from './cut-instruction';
import {conductAnalysis} from './helpers/reduced-analysis';
import type {ReducedInstruction} from './helpers/types';
import {parsePath} from './parse-path';
import {reduceInstructions} from './reduce-instructions';
import {serializeInstructions} from './serialize-instructions';

export const cutPath = (d: string, length: number): string => {
	const parsed = parsePath(d);
	const reduced = reduceInstructions(parsed);
	const constructed = conductAnalysis(reduced);

	const newInstructions: ReducedInstruction[] = [];

	let summedUpLength = 0;

	for (const segment of constructed) {
		for (const instructionAndInfo of segment.instructionsAndInfo) {
			if (summedUpLength + instructionAndInfo.length > length) {
				const remainingLength = length - summedUpLength;
				const progress = remainingLength / instructionAndInfo.length;
				// cut
				const cut = cutInstruction({
					instruction: instructionAndInfo.instruction,
					lastPoint: instructionAndInfo.startPoint,
					progress,
				});
				newInstructions.push(cut);
				return serializeInstructions(newInstructions);
			}

			summedUpLength += instructionAndInfo.length;
			newInstructions.push(instructionAndInfo.instruction);

			if (summedUpLength === length) {
				return serializeInstructions(newInstructions);
			}
		}
	}

	return serializeInstructions(newInstructions);
};
