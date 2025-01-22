import type {BufferIterator} from '../../buffer-iterator';
import {getArrayBufferIterator} from '../../buffer-iterator';
import type {LogLevel} from '../../log';
import type {ParseMediaSrc} from '../../options';
import type {ReaderInterface} from '../../readers/reader';
import {makeParserState} from '../../state/parser-state';
import type {IsoBaseMediaBox} from './base-media-box';
import {processBox} from './process-box';

export const getMoovAtom = async ({
	readerInterface,
	endOfMdat,
	src,
	signal,
	logLevel,
}: {
	readerInterface: ReaderInterface;
	endOfMdat: number;
	src: ParseMediaSrc;
	signal: AbortSignal | undefined;
	logLevel: LogLevel;
}) => {
	const {contentLength, reader} = await readerInterface.read({
		src,
		range: endOfMdat,
		signal,
	});

	if (contentLength === null) {
		throw new Error(
			'Media was passed with no content length. This is currently not supported. Ensure the media has a "Content-Length" HTTP header.',
		);
	}

	const iterator: BufferIterator = getArrayBufferIterator(
		new Uint8Array([]),
		contentLength,
	);

	while (true) {
		const result = await reader.reader.read();
		if (result.value) {
			iterator.addData(result.value);
		}

		if (result.done) {
			break;
		}
	}

	const state = makeParserState({
		hasAudioTrackHandlers: false,
		hasVideoTrackHandlers: false,
		signal,
		iterator,
		fields: {
			structure: true,
		},
		onAudioTrack: null,
		onVideoTrack: null,
		supportsContentRange: true,
		contentLength,
		logLevel,
		mode: 'query',
	});

	const boxes: IsoBaseMediaBox[] = [];

	while (true) {
		const box = await processBox(state);
		if (box) {
			boxes.push(box);
		}

		if (iterator.counter.getOffset() + endOfMdat > contentLength) {
			break;
		}
	}
};
