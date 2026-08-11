import type {MediaParserController} from '../../../controller/media-parser-controller';
import type {PrefetchCache} from '../../../fetch';
import {getArrayBufferIterator} from '../../../iterator/buffer-iterator';
import type {MediaParserLogLevel} from '../../../log';
import type {ParseMediaSrc} from '../../../options';
import type {MediaParserReaderInterface} from '../../../readers/reader';

export const getMfroAtom = async ({
	src,
	contentLength,
	readerInterface,
	controller,
	logLevel,
	prefetchCache,
}: {
	src: ParseMediaSrc;
	contentLength: number;
	readerInterface: MediaParserReaderInterface;
	controller: MediaParserController;
	logLevel: MediaParserLogLevel;
	prefetchCache: PrefetchCache;
}) => {
	const result = await readerInterface.read({
		controller,
		range: [contentLength - 16, contentLength - 1],
		src,
		logLevel,
		prefetchCache,
	});

	const {value} = await result.reader.reader.read();
	if (!value) {
		return null;
	}

	result.reader.abort();
	const iterator = getArrayBufferIterator({
		initialData: value,
		maxBytes: value.length,
		logLevel: 'error',
	});
	const size = iterator.getUint32();
	if (size !== 16) {
		iterator.destroy();
		return null;
	}

	const atom = iterator.getByteString(4, false);
	if (atom !== 'mfro') {
		iterator.destroy();
		return null;
	}

	const version = iterator.getUint8();
	if (version !== 0) {
		iterator.destroy();
		return null;
	}

	// flags
	iterator.discard(3);
	const parentSize = iterator.getUint32();

	iterator.destroy();
	return parentSize;
};
