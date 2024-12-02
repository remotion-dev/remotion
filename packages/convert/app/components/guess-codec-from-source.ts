import {ParseMediaContainer} from '@remotion/media-parser';
import {ConvertMediaContainer} from '@remotion/webcodecs';
import {Source} from '~/lib/convert-state';

const guessFromExtension = (src: string) => {
	if (src.endsWith('.webm')) {
		return 'webm';
	}
	if (src.endsWith('.mkv')) {
		return 'webm';
	}
	if (src.endsWith('.avi')) {
		return 'avi';
	}
	return 'mp4';
};

export const guessContainerFromSource = (
	source: Source,
): ParseMediaContainer => {
	if (source.type === 'file') {
		return guessFromExtension(source.file.name);
	}

	if (source.type === 'url') {
		return guessFromExtension(source.url);
	}

	throw new Error(`Unhandled source type: ${source satisfies never}`);
};

export const getDefaultContainerForConversion = (
	source: Source,
): ConvertMediaContainer => {
	const guessed = guessContainerFromSource(source);

	if (guessed === 'avi') {
		return 'mp4';
	}

	if (guessed === 'mp4') {
		return 'webm';
	}

	if (guessed === 'webm') {
		return 'mp4';
	}

	throw new Error('Unhandled container ' + (guessed satisfies never));
};
