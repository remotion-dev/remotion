import {
	ConvertMediaContainer,
	getAvailableContainers,
} from '@remotion/webcodecs';
import {Source} from '~/lib/convert-state';

export const guessContainerFromSource = (
	source: Source,
): ConvertMediaContainer => {
	if (source.type === 'file') {
		if (source.file.name.endsWith('.webm')) {
			return 'webm';
		}
		return 'mp4';
	}

	if (source.type === 'url') {
		if (source.url.endsWith('.webm')) {
			return 'webm';
		}

		return 'mp4';
	}

	throw new Error(`Unhandled source type: ${source satisfies never}`);
};

export const getDefaultContainerForConversion = (
	source: Source,
): ConvertMediaContainer => {
	const availableContainers = getAvailableContainers();
	const guessed = guessContainerFromSource(source);
	return availableContainers.find((container) => container !== guessed)!;
};
