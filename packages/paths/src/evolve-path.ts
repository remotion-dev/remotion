import {getLength} from './get-length';

/**
 * Animates an SVG from being invisible to it's full length.
 * @param {string} path A valid SVG path
 * @param {number} progress The first valid SVG path
 * @link https://remotion.dev/docs/paths/evolve-path
 */
export const evolvePath = (progress: number, path: string) => {
	const length = getLength(path);
	const strokeDasharray = `${length} ${length}`;
	const strokeDashoffset = length - progress * length;

	return {strokeDasharray, strokeDashoffset};
};
