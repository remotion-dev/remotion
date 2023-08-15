import {constructFromInstructions} from './helpers/construct';
import {parsePath} from './parse-path';
import {serializeInstructions} from './serialize-instructions';

/**
 * @description Splits a valid SVG path into it's parts.
 * @param {string} path A valid SVG path
 * @see [Documentation](https://remotion.dev/docs/paths/get-subpaths)
 */
export const getSubpaths = (path: string): string[] => {
	const parsed = parsePath(path);
	const {segments} = constructFromInstructions(parsed);

	return segments.map((seg) => {
		return serializeInstructions(seg);
	});
};
