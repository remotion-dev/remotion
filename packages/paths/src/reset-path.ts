import {getBoundingBox} from './get-bounding-box';
import {translatePath} from './translate-path';

export const resetPath = (d: string) => {
	const box = getBoundingBox(d);
	return translatePath(d, -box.x1, -box.y1);
};
