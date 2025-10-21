import type {InputFormat} from 'mediabunny';
import {
	ADTS,
	FLAC,
	MATROSKA,
	MP3,
	MP4,
	OGG,
	QTFF,
	WAVE,
	WEBM,
} from 'mediabunny';
import type {OutputContainer} from '~/seo';

export const getDefaultOutputFormat = (
	inputContainer: InputFormat,
): OutputContainer => {
	if (inputContainer === MP4 || inputContainer === QTFF) {
		return 'webm';
	}

	if (inputContainer === WEBM || inputContainer === MATROSKA) {
		return 'mp4';
	}

	if (inputContainer === WAVE) {
		return 'mp3';
	}

	if (
		inputContainer === ADTS ||
		inputContainer === MP3 ||
		inputContainer === OGG ||
		inputContainer === FLAC
	) {
		return 'wav';
	}

	throw new Error('not all input formats handled: ' + inputContainer.name);
};
