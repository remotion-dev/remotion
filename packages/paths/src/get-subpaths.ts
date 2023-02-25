import {construct} from './helpers/construct';
import {serializeInstructions} from './serialize-instructions';

/**
 * @description Splits a valid SVG path into it's parts.
 * @param {string} path A valid SVG path
 * @see [Documentation](https://remotion.dev/docs/paths/get-subpaths)
 */
export const getSubpaths = (path: string): string[] => {
	const {segments} = construct(path);

	return segments.map((seg) => {
		return serializeInstructions(seg);
	});
};
