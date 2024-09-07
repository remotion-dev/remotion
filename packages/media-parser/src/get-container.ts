import {getMoovBox} from './boxes/iso-base-media/traversal';
import {getMainSegment} from './boxes/webm/traversal';
import type {ParseMediaContainer} from './options';
import type {AnySegment} from './parse-result';

export const getContainer = (
	segments: AnySegment[],
): ParseMediaContainer | null => {
	const moovBox = getMoovBox(segments);
	if (moovBox) {
		return 'mp4';
	}

	const mainSegment = getMainSegment(segments);
	if (mainSegment) {
		return 'webm';
	}

	return null;
};

export const hasContainer = (boxes: AnySegment[]): boolean => {
	try {
		return getContainer(boxes) !== null;
	} catch (e) {
		return false;
	}
};
