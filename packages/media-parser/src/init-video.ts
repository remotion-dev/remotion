import type {FlacStructure} from './containers/flac/types';
import type {WavStructure} from './containers/wav/types';
import {
	IsAGifError,
	IsAPdfError,
	IsAnImageError,
	IsAnUnsupportedFileTypeError,
} from './errors';
import {Log} from './log';
import type {Mp3Structure} from './parse-result';
import type {ParserState} from './state/parser-state';

export const initVideo = ({
	state,
	mimeType,
	name,
	contentLength,
}: {
	state: ParserState;
	mimeType: string | null;
	name: string | null;
	contentLength: number;
}) => {
	const fileType = state.iterator.detectFileType();

	if (fileType.type === 'riff') {
		Log.verbose(state.logLevel, 'Detected RIFF container');
		state.setStructure({
			type: 'riff',
			boxes: [],
		});
		return;
	}

	if (fileType.type === 'iso-base-media') {
		Log.verbose(state.logLevel, 'Detected ISO Base Media container');
		state.setStructure({
			type: 'iso-base-media',
			boxes: [],
		});
		return;
	}

	if (fileType.type === 'webm') {
		Log.verbose(state.logLevel, 'Detected Matroska container');
		state.setStructure({
			boxes: [],
			type: 'matroska',
		});
		return;
	}

	if (fileType.type === 'transport-stream') {
		Log.verbose(state.logLevel, 'Detected MPEG-2 Transport Stream');
		state.setStructure({
			boxes: [],
			type: 'transport-stream',
		});
		return;
	}

	if (fileType.type === 'mp3') {
		Log.verbose(state.logLevel, 'Detected MP3');
		const structure: Mp3Structure = {
			boxes: [],
			type: 'mp3',
		};
		state.setStructure(structure);
		return;
	}

	if (fileType.type === 'wav') {
		Log.verbose(state.logLevel, 'Detected WAV');
		const structure: WavStructure = {
			boxes: [],
			type: 'wav',
		};
		state.setStructure(structure);
		return;
	}

	if (fileType.type === 'flac') {
		Log.verbose(state.logLevel, 'Detected FLAC');
		const structure: FlacStructure = {
			boxes: [],
			type: 'flac',
		};
		state.setStructure(structure);
		return;
	}

	if (fileType.type === 'aac') {
		Log.verbose(state.logLevel, 'Detected AAC');
		state.setStructure({
			type: 'aac',
			boxes: [],
		});
		return;
	}

	if (fileType.type === 'm3u') {
		Log.verbose(state.logLevel, 'Detected M3U');
		state.setStructure({
			type: 'm3u',
			boxes: [],
		});
		return;
	}

	if (fileType.type === 'gif') {
		return Promise.reject(
			new IsAGifError({
				message: 'GIF files are not yet supported',
				mimeType,
				sizeInBytes: contentLength,
				fileName: name,
			}),
		);
	}

	if (fileType.type === 'pdf') {
		return Promise.reject(
			new IsAPdfError({
				message: 'GIF files are not supported',
				mimeType,
				sizeInBytes: contentLength,
				fileName: name,
			}),
		);
	}

	if (
		fileType.type === 'bmp' ||
		fileType.type === 'jpeg' ||
		fileType.type === 'png' ||
		fileType.type === 'webp'
	) {
		return Promise.reject(
			new IsAnImageError({
				message: 'Image files are not supported',
				imageType: fileType.type,
				dimensions: fileType.dimensions,
				mimeType,
				sizeInBytes: contentLength,
				fileName: name,
			}),
		);
	}

	if (fileType.type === 'unknown') {
		return Promise.reject(
			new IsAnUnsupportedFileTypeError({
				message: 'Unknown file format',
				mimeType,
				sizeInBytes: contentLength,
				fileName: name,
			}),
		);
	}

	return Promise.reject(
		new Error('Unknown video format ' + (fileType satisfies never)),
	);
};
