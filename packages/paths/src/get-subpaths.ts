import {construct} from './helpers/construct';
import {serializePath} from './helpers/serialize';

/**
 * Splits a valid SVG path into it's parts.
 * @param {string} path A valid SVG path
 * @link https://remotion.dev/docs/paths/get-subpaths
 */
export const getSubpaths = (path: string): string[] => {
	const {segments} = construct(path);

	return segments.map((seg) => {
		return serializePath(seg);
	});
};
