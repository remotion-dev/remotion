import {parseIsoBaseMedia} from './boxes/iso-base-media/parse-boxes';
import {parseMp3} from './boxes/mp3/parse-mp3';
import {parseRiff} from './boxes/riff/parse-riff';
import {parseTransportStream} from './boxes/transport-stream/parse-transport-stream';
import {parseWebm} from './boxes/webm/parse-webm-header';
import type {BufferIterator} from './buffer-iterator';
import {
	IsAGifError,
	IsAnImageError,
	IsAnUnsupportedAudioTypeError,
	IsAnUnsupportedFileTypeError,
	IsAPdfError,
} from './errors';
import {Log} from './log';
import type {IsoBaseMediaBox, Mp3Structure, ParseResult} from './parse-result';
import type {ParserState} from './state/parser-state';

export type BoxAndNext = {
	box: IsoBaseMediaBox | null;
	skipTo: number | null;
};

const initVideo = ({
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
		return Promise.reject(
			new IsAnUnsupportedAudioTypeError({
				message: 'WAV files are not yet supported',
				mimeType,
				sizeInBytes: contentLength,
				fileName: name,
				audioType: 'wav',
			}),
		);
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

export const parseVideo = async ({
	iterator,
	state,
	mimeType,
	contentLength,
	name,
}: {
	iterator: BufferIterator;
	state: ParserState;
	mimeType: string | null;
	contentLength: number | null;
	name: string | null;
}): Promise<ParseResult> => {
	if (iterator.bytesRemaining() === 0) {
		return Promise.reject(new Error('no bytes'));
	}

	const structure = state.structure.getStructureOrNull();

	if (structure === null) {
		await initVideo({iterator, state, mimeType, name, contentLength});
		return {skipTo: null};
	}

	if (structure.type === 'riff') {
		return parseRiff({iterator, state});
	}

	if (structure.type === 'mp3') {
		return parseMp3({iterator, state});
	}

	if (structure.type === 'iso-base-media') {
		return parseIsoBaseMedia({
			iterator,
			state,
		});
	}

	if (structure.type === 'matroska') {
		return parseWebm({iterator, state});
	}

	if (structure.type === 'transport-stream') {
		return parseTransportStream({
			iterator,
			state,
		});
	}

	return Promise.reject(
		new Error('Unknown video format ' + (structure satisfies never)),
	);
};
