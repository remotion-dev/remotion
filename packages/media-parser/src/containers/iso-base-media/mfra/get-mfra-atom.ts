import type {MediaParserController} from '../../../controller/media-parser-controller';
import type {PrefetchCache} from '../../../fetch';
import type {BufferIterator} from '../../../iterator/buffer-iterator';
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
	prefetchCache,
	logLevel,
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

	let data = new Uint8Array([]);

	while (true) {
		const res = await result.reader.reader.read();
		if (res.value) {
			data = new Uint8Array([...data, ...res.value]);
		}

		if (res.done) {
			break;
		}
	}

	const iterator: BufferIterator = getArrayBufferIterator({
		initialData: data,
		maxBytes: data.length,
		logLevel,
		useFixedSizeBuffer: null,
		checkResize: false,
	});

	return iterator;
};
