import {isRiffAvi} from './boxes/riff/traversal';
import type {ParseMediaContainer} from './options';
import type {Structure} from './parse-result';

export const getContainer = (segments: Structure): ParseMediaContainer => {
	if (segments.type === 'iso-base-media') {
		return 'mp4';
	}

	if (segments.type === 'matroska') {
		return 'webm';
	}

	if (segments.type === 'transport-stream') {
		return 'transport-stream';
	}

	if (segments.type === 'riff') {
		if (isRiffAvi(segments)) {
			return 'avi';
		}
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
