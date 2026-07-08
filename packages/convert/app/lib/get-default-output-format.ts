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
import type {OutputContainer, RouteAction} from '~/seo';

const getDefaultConversionFormat = (
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

const getSameOutputFormat = (
	inputContainer: InputFormat,
): OutputContainer | null => {
	if (inputContainer === MP4) {
		return 'mp4';
	}

	if (inputContainer === QTFF) {
		return 'mov';
	}

	if (inputContainer === WEBM) {
		return 'webm';
	}

	if (inputContainer === MATROSKA) {
		return 'mkv';
	}

	if (inputContainer === WAVE) {
		return 'wav';
	}

	if (inputContainer === ADTS) {
		return 'aac';
	}

	if (inputContainer === MP3) {
		return 'mp3';
	}

	return null;
};

export const getDefaultEditOutputFormat = (
	inputContainer: InputFormat,
): OutputContainer => {
	return (
		getSameOutputFormat(inputContainer) ??
		getDefaultConversionFormat(inputContainer)
	);
};

export const getDefaultConvertOutputFormat = ({
	inputContainer,
	action,
}: {
	inputContainer: InputFormat;
	action: RouteAction;
}): OutputContainer => {
	if (action.type === 'convert') {
		return action.output;
	}

	return getDefaultConversionFormat(inputContainer);
};
