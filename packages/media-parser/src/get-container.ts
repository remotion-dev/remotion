import type {ParseMediaContainer} from './options';
import type {Structure} from './parse-result';

export const getContainer = (
	segments: Structure,
): ParseMediaContainer | null => {
	if (segments.type === 'iso-base-media') {
		return 'mp4';
	}

	if (segments.type === 'matroska') {
		return 'webm';
	}

	throw new Error('Unknown container');
};

export const hasContainer = (boxes: Structure): boolean => {
	try {
		return getContainer(boxes) !== null;
	} catch {
		return false;
	}
};
