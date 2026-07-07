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

const shouldKeepInputContainerByDefault = (action: RouteAction) => {
	if (action.type === 'convert' || action.type === 'generic-convert') {
		return false;
	}

	if (
		action.type === 'generic-rotate' ||
		action.type === 'rotate-format' ||
		action.type === 'generic-mirror' ||
		action.type === 'mirror-format' ||
		action.type === 'generic-resize' ||
		action.type === 'resize-format' ||
		action.type === 'generic-crop' ||
		action.type === 'crop-format' ||
		action.type === 'generic-trim' ||
		action.type === 'trim-format' ||
		action.type === 'generic-probe' ||
		action.type === 'report' ||
		action.type === 'transcribe' ||
		action.type === 'timing-editor'
	) {
		return true;
	}

	throw new Error('Unsupported action: ' + (action satisfies never));
};

export const getDefaultOutputFormat = ({
	inputContainer,
	action,
}: {
	inputContainer: InputFormat;
	action: RouteAction;
}): OutputContainer => {
	if (action.type === 'convert') {
		return action.output;
	}

	if (shouldKeepInputContainerByDefault(action)) {
		const sameFormat = getSameOutputFormat(inputContainer);
		if (sameFormat) {
			return sameFormat;
		}
	}

	return getDefaultConversionFormat(inputContainer);
};
