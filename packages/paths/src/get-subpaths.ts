import {constructFromInstructions} from './helpers/construct';
import {parsePath} from './parse-path';
import {serializeInstructions} from './serialize-instructions';

/*
 * @description Takes an SVG path and returns an array of subpaths, splitting the path by `M` and `m` statements.
 * @see [Documentation](https://www.remotion.dev/docs/paths/get-subpaths)
 */
export const getSubpaths = (path: string): string[] => {
	const parsed = parsePath(path);
	const {segments} = constructFromInstructions(parsed);

	return segments.map((seg) => {
		return serializeInstructions(seg);
	});
};
