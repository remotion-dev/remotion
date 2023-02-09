import {parsePath} from '../parse-path';
import {reduceInstructions} from '../reduce-instructions';
import {serializeInstructions} from '../serialize-instructions';
import type {PointTransformer} from './warp-helpers';
import {
	fixZInstruction,
	svgPathInterpolate,
	warpTransform,
} from './warp-helpers';

export const warpPath = (
	path: string,
	transformer: PointTransformer,
	interpolationThreshold: number
): string => {
	const reduced = reduceInstructions(parsePath(path));
	const withZFix = fixZInstruction(reduced);
	const interpolated = svgPathInterpolate(withZFix, interpolationThreshold);

	return serializeInstructions(warpTransform(interpolated, transformer));
};
