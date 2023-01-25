import {construct} from './helpers/construct';
import {getPartAtLength} from './helpers/get-part-at-length';

/**
 * Gets the coordinates of a point which is on an SVG path.
 * @param {string} path A valid SVG path
 * @param {number} length The length at which the point should be sampled
 * @link https://remotion.dev/docs/paths/get-point-at-length
 */
export const getPointAtLength = (path: string, length: number) => {
	const constructed = construct(path);
	const fractionPart = getPartAtLength(path, length);
	const functionAtPart = constructed.functions[fractionPart.i];

	if (functionAtPart) {
		return functionAtPart.getPointAtLength(fractionPart.fraction);
	}

	if (constructed.initial_point) {
		return constructed.initial_point;
	}

	throw new Error('Wrong function at this part.');
};
