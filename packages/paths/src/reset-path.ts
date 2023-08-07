import {getBoundingBox} from './get-bounding-box';
import {translatePath} from './translate-path';

/**
 * @description Translates an SVG path so that the top-left corner of the bounding box is at 0, 0.
 * @param {string} d a valid SVG path
 * @see [Documentation](https://www.remotion.dev/docs/paths/reset-path)
 */
export const resetPath = (d: string) => {
	const box = getBoundingBox(d);
	return translatePath(d, -box.x1, -box.y1);
};
