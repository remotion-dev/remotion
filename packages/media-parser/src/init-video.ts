import type {WavStructure} from './boxes/wav/types';
import type {BufferIterator} from './buffer-iterator';
import {
	IsAGifError,
	IsAPdfError,
	IsAnImageError,
	IsAnUnsupportedAudioTypeError,
	IsAnUnsupportedFileTypeError,
} from './errors';
import {Log} from './log';
import type {Mp3Structure} from './parse-result';
import type {ParserState} from './state/parser-state';

export const initVideo = ({
	iterator,
	state,
	mimeType,
	name,
	contentLength,
}: {
	iterator: BufferIterator;
	state: ParserState;
	mimeType: string | null;
	name: string | null;
	contentLength: number | null;
}) => {
	const fileType = iterator.detectFileType();

	if (fileType.type === 'riff') {
		Log.verbose(state.logLevel, 'Detected RIFF container');
		state.structure.setStructure({
			type: 'riff',
			boxes: [],
		});
		return;
	}

	if (fileType.type === 'iso-base-media') {
		Log.verbose(state.logLevel, 'Detected ISO Base Media container');
		state.structure.setStructure({
			type: 'iso-base-media',
			boxes: [],
		});
		return;
	}

	if (fileType.type === 'webm') {
		Log.verbose(state.logLevel, 'Detected Matroska container');
		state.structure.setStructure({
			boxes: [],
			type: 'matroska',
		});
		return;
	}

	if (fileType.type === 'transport-stream') {
		Log.verbose(state.logLevel, 'Detected MPEG-2 Transport Stream');
		state.structure.setStructure({
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
		state.structure.setStructure(structure);
		return;
	}

	if (fileType.type === 'wav') {
		Log.verbose(state.logLevel, 'Detected WAV');
		const structure: WavStructure = {
			boxes: [],
			type: 'wav',
		};
		state.structure.setStructure(structure);
		return;
	}

	if (fileType.type === 'aac') {
		return Promise.reject(
			new IsAnUnsupportedAudioTypeError({
				message: 'AAC files are not yet supported',
				mimeType,
				sizeInBytes: contentLength,
				fileName: name,
				audioType: 'aac',
			}),
		);
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
