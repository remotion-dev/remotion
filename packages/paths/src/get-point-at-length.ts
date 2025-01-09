import {getInstructionIndexAtLengthFromConstructed} from './get-instruction-index-at-length';
import {construct} from './helpers/construct';

/*
 * @description Gets the coordinates of a point which is on an SVG path.
 * @see [Documentation](https://www.remotion.dev/docs/paths/get-point-at-length)
 */
export const getPointAtLength = (path: string, length: number) => {
	const constructed = construct(path);
	const fractionPart = getInstructionIndexAtLengthFromConstructed(
		constructed,
		length,
	);
	const functionAtPart = constructed.functions[fractionPart.index + 1];

	if (functionAtPart) {
		return functionAtPart.getPointAtLength(fractionPart.lengthIntoInstruction);
	}

	if (constructed.initialPoint) {
		return constructed.initialPoint;
	}

	throw new Error('Wrong function at this part.');
};
