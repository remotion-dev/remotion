import {getBoundingBox} from './get-bounding-box';
import {translatePath} from './translate-path';

export type CenterPathTarget = {
	x: number;
	y: number;
};

/*
 * @description Translates an SVG path so that the center of the bounding box is at the specified point. Defaults to 0, 0.
 * @see [Documentation](https://www.remotion.dev/docs/paths/center-path)
 */
export const centerPath = (
	d: string,
	target: CenterPathTarget = {x: 0, y: 0},
) => {
	const box = getBoundingBox(d);
	const dx = target.x - (box.x1 + box.x2) / 2;
	const dy = target.y - (box.y1 + box.y2) / 2;

	return translatePath(d, dx, dy);
};
