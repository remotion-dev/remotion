import {construct} from './helpers/construct';

/**
 * Splits a valid SVG path into it's parts.
 * @param {string} path A valid SVG path
 * @link https://remotion.dev/docs/paths/get-subpaths
 */
export const getSubpaths = (path: string): string[] => {
	const {segments} = construct(path);

	return segments
		.map((seg) => {
			return seg.map((s) => s.join(' '));
		})
		.map((_s) => _s.join(' '));
};
