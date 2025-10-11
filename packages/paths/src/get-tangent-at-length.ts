import {getInstructionIndexAtLengthFromConstructed} from './get-instruction-index-at-length';
import {construct} from './helpers/construct';

/*
 * @description Gets tangent values x and y of a point which is on an SVG path.
 * @see [Documentation](https://www.remotion.dev/docs/paths/get-tangent-at-length)
 */

export const getTangentAtLength = (path: string, length: number) => {
	const constructed = construct(path);

	const fractionPart = getInstructionIndexAtLengthFromConstructed(
		constructed,
		length,
	);
	const functionAtPart = constructed.functions[fractionPart.index + 1];
	if (functionAtPart) {
		return functionAtPart.getTangentAtLength(
			fractionPart.lengthIntoInstruction,
		);
	}

	if (constructed.initialPoint) {
		return {x: 0, y: 0};
	}

	throw new Error('Wrong function at this part.');
};
