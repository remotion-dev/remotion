import {parseIsoBaseMediaBoxes} from './boxes/iso-base-media/process-box';
import {parseRiff} from './boxes/riff/parse-box';
import {makeNextPesHeaderStore} from './boxes/transport-stream/next-pes-header-store';
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
import {Log, type LogLevel} from './log';
import type {Options, ParseMediaFields} from './options';
import type {IsoBaseMediaBox, ParseResult} from './parse-result';
import type {ParserState} from './state/parser-state';

export type PartialMdatBox = {
	type: 'partial-mdat-box';
	boxSize: number;
	fileOffset: number;
};

export type BoxAndNext =
	| {
			type: 'complete';
			box: IsoBaseMediaBox;
			size: number;
			skipTo: number | null;
	  }
	| {
			type: 'incomplete';
	  }
	| PartialMdatBox;

export const parseVideo = ({
	iterator,
	state,
	signal,
	logLevel,
	fields,
	mimeType,
	contentLength,
	name,
}: {
	iterator: BufferIterator;
	state: ParserState;
	signal: AbortSignal | null;
	logLevel: LogLevel;
	fields: Options<ParseMediaFields>;
	mimeType: string | null;
	contentLength: number | null;
	name: string | null;
}): Promise<ParseResult> => {
	if (iterator.bytesRemaining() === 0) {
		return Promise.reject(new Error('no bytes'));
	}

	const fileType = iterator.detectFileType();

	if (fileType.type === 'riff') {
		Log.verbose(logLevel, 'Detected RIFF container');
		state.structure.setStructure({
			type: 'riff',
			boxes: [],
		});

		return Promise.resolve(parseRiff({iterator, state, fields}));
	}

	if (fileType.type === 'iso-base-media') {
		Log.verbose(logLevel, 'Detected ISO Base Media container');
		const initialBoxes: IsoBaseMediaBox[] = [];
		state.structure.setStructure({
			type: 'iso-base-media',
			boxes: initialBoxes,
		});

		return parseIsoBaseMediaBoxes({
			iterator,
			maxBytes: Infinity,
			allowIncompleteBoxes: true,
			initialBoxes,
			state,
			continueMdat: false,
			signal,
			logLevel,
			fields,
		});
	}

	if (fileType.type === 'webm') {
		Log.verbose(logLevel, 'Detected Matroska container');
		state.structure.setStructure({
			boxes: [],
			type: 'matroska',
		});
		return parseWebm({counter: iterator, state, fields});
	}

	if (fileType.type === 'transport-stream') {
		Log.verbose(logLevel, 'Detected MPEG-2 Transport Stream');
		state.structure.setStructure({
			boxes: [],
			type: 'transport-stream',
		});
		return parseTransportStream({
			iterator,
			state,
			streamBuffers: new Map(),
			fields,
			nextPesHeaderStore: makeNextPesHeaderStore(),
		});
	}

	if (fileType.type === 'mp3') {
		return Promise.reject(
			new IsAnUnsupportedAudioTypeError({
				message: 'MP3 files are not yet supported',
				mimeType,
				sizeInBytes: contentLength,
				fileName: name,
				audioType: 'mp3',
			}),
		);
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
