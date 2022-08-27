import {construct} from './helpers/construct';
import {getPartAtLength} from './helpers/get-part-at-length';

/**
 * Gets tangent values x and y of a point which is on an SVG path
 * @param {string} path A valid SVG path
 * @param {number} length The length at which the tangent should be sampled
 * @link https://remotion.dev/docs/paths/get-tangent-at-length
 */
export const getTangentAtLength = (path: string, length: number) => {
	const constructed = construct(path);

	const fractionPart = getPartAtLength(path, length);
	const functionAtPart = constructed.functions[fractionPart.i];
	if (functionAtPart) {
		return functionAtPart.getTangentAtLength(fractionPart.fraction);
	}

	if (constructed.initial_point) {
		return {x: 0, y: 0};
	}

	throw new Error('Wrong function at this part.');
};
