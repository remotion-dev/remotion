import type {ParseMediaContainer} from '@remotion/media-parser';
import type {ConvertMediaContainer} from '@remotion/webcodecs';
import type {Source} from '~/lib/convert-state';
import type {RouteAction} from '~/seo';

const guessFromExtension = (src: string): ParseMediaContainer => {
	if (src.endsWith('.webm')) {
		return 'webm';
	}

	if (src.endsWith('.mkv')) {
		return 'webm';
	}

	if (src.endsWith('.avi')) {
		return 'avi';
	}

	if (src.endsWith('.ts')) {
		return 'transport-stream';
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

const shouldKeepSameContainerByDefault = (action: RouteAction) => {
	if (action.type === 'generic-convert') {
		return false;
	}

	if (action.type === 'generic-mirror') {
		return true;
	}

	if (action.type === 'generic-rotate') {
		return true;
	}

	if (action.type === 'mirror-format') {
		return true;
	}

	if (action.type === 'rotate-format') {
		return true;
	}

	if (action.type === 'convert') {
		return false;
	}

	if (action.type === 'generic-probe') {
		return false;
	}

	if (action.type === 'resize-format') {
		return true;
	}

	if (action.type === 'generic-resize') {
		return true;
	}

	throw new Error(`Unhandled action type: ${action satisfies never}`);
};

export const getDefaultContainerForConversion = (
	source: Source,
	action: RouteAction,
): ConvertMediaContainer => {
	const guessed = guessContainerFromSource(source);
	const keepSame = shouldKeepSameContainerByDefault(action);

	if (guessed === 'avi') {
		return 'mp4';
	}

	if (guessed === 'mp4') {
		return keepSame ? 'mp4' : 'webm';
	}

	if (guessed === 'webm') {
		return keepSame ? 'webm' : 'mp4';
	}

	if (guessed === 'transport-stream') {
		return 'mp4';
	}

	throw new Error('Unhandled container ' + (guessed satisfies never));
};
