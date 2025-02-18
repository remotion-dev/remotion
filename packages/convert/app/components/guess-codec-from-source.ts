import type {MediaParserContainer} from '@remotion/media-parser';
import type {ConvertMediaContainer} from '@remotion/webcodecs';
import type {Source} from '~/lib/convert-state';
import type {RouteAction} from '~/seo';

const guessFromExtension = (src: string): MediaParserContainer => {
	if (src.endsWith('.webm')) {
		return 'webm';
	}

	if (src.endsWith('.mkv')) {
		return 'webm';
	}

	if (src.endsWith('.avi')) {
		return 'avi';
	}

	if (src.endsWith('.mp3')) {
		return 'mp3';
	}

	if (src.endsWith('.ts')) {
		return 'transport-stream';
	}

	if (src.endsWith('.m3u8')) {
		return 'm3u8';
	}

	if (src.endsWith('.wav') || src.endsWith('.wave')) {
		return 'wav';
	}

	if (src.endsWith('.flac')) {
		return 'flac';
	}

	if (src.endsWith('.mp3')) {
		return 'mp3';
	}

	return 'mp4';
};

export const guessContainerFromSource = (
	source: Source,
): MediaParserContainer => {
	if (source.type === 'file') {
		return guessFromExtension(source.file.name);
	}

	if (source.type === 'url') {
		return guessFromExtension(new URL(source.url).pathname);
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

	if (action.type === 'report') {
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

	if (guessed === 'mp3') {
		return 'wav';
	}

	if (guessed === 'wav') {
		return 'wav';
	}

	if (guessed === 'aac') {
		return 'wav';
	}

	if (guessed === 'flac') {
		return 'wav';
	}

	if (guessed === 'm3u8') {
		return 'mp4';
	}

	throw new Error('Unhandled container ' + (guessed satisfies never));
};
