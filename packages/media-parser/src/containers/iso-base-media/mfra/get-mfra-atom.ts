import type {MediaParserController} from '../../../controller/media-parser-controller';
import type {PrefetchCache} from '../../../fetch';
import {getArrayBufferIterator} from '../../../iterator/buffer-iterator';
import type {MediaParserLogLevel} from '../../../log';
import type {ParseMediaSrc} from '../../../options';
import type {MediaParserReaderInterface} from '../../../readers/reader';

export const getMfraAtom = async ({
	src,
	contentLength,
	readerInterface,
	controller,
	parentSize,
	logLevel,
	prefetchCache,
}: {
	src: ParseMediaSrc;
	contentLength: number;
	readerInterface: MediaParserReaderInterface;
	controller: MediaParserController;
	parentSize: number;
	logLevel: MediaParserLogLevel;
	prefetchCache: PrefetchCache;
}) => {
	const result = await readerInterface.read({
		controller,
		range: [contentLength - parentSize, contentLength - 1],
		src,
		logLevel,
		prefetchCache,
	});

	const iterator = getArrayBufferIterator({
		initialData: new Uint8Array(),
		maxBytes: parentSize,
		logLevel: 'error',
	});
	while (true) {
		const res = await result.reader.reader.read();
		if (res.value) {
			iterator.addData(res.value);
		}

		if (res.done) {
			break;
		}
	}

	return iterator;
};
