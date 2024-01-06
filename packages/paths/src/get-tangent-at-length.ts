import {construct} from './helpers/construct';
import {getSegmentAtLength} from './helpers/get-part-at-length';

/**
 * @description Gets tangent values x and y of a point which is on an SVG path
 * @param {string} path A valid SVG path
 * @param {number} length The length at which the tangent should be sampled
 * @see [Documentation](https://remotion.dev/docs/paths/get-tangent-at-length)
 */

export const getTangentAtLength = (path: string, length: number) => {
	const constructed = construct(path);

	const fractionPart = getSegmentAtLength(constructed, length);
	const functionAtPart = constructed.functions[fractionPart.index];
	if (functionAtPart) {
		return functionAtPart.getTangentAtLength(fractionPart.fraction);
	}

	if (constructed.initialPoint) {
		return {x: 0, y: 0};
	}

	throw new Error('Wrong function at this part.');
};
