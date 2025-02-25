import {isRiffAvi} from './containers/riff/traversal';
import type {MediaParserContainer} from './options';
import type {Structure} from './parse-result';

export const getContainer = (segments: Structure): MediaParserContainer => {
	if (segments.type === 'iso-base-media') {
		return 'mp4';
	}

	if (segments.type === 'matroska') {
		return 'webm';
	}

	if (segments.type === 'transport-stream') {
		return 'transport-stream';
	}

	if (segments.type === 'mp3') {
		return 'mp3';
	}

	if (segments.type === 'wav') {
		return 'wav';
	}

	if (segments.type === 'flac') {
		return 'flac';
	}

	if (segments.type === 'riff') {
		if (isRiffAvi(segments)) {
			return 'avi';
		}

		throw new Error('Unknown RIFF container ' + segments.type);
	}

	if (segments.type === 'aac') {
		return 'aac';
	}

	if (segments.type === 'm3u') {
		return 'm3u8';
	}

	throw new Error('Unknown container ' + (segments satisfies never));
};

export const hasContainer = (boxes: Structure): boolean => {
	try {
		return getContainer(boxes) !== null;
	} catch {
		return false;
	}
};
