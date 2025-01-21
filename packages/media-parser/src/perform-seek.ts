import type {BufferIterator} from './buffer-iterator';
import type {LogLevel} from './log';
import {Log} from './log';
import type {Reader, ReaderInterface} from './readers/reader';

export const performSeek = async ({
	seekTo,
	iterator,
	supportsContentRange,
	logLevel,
	currentReader,
	readerInterface,
	src,
	signal,
	contentLength,
}: {
	seekTo: number;
	iterator: BufferIterator;
	supportsContentRange: boolean;
	logLevel: LogLevel;
	currentReader: Reader;
	readerInterface: ReaderInterface;
	src: string | Blob;
	signal: AbortSignal | undefined;
	contentLength: number;
}): Promise<Reader> => {
	const skippingAhead = seekTo > iterator.counter.getOffset();
	if (!skippingAhead && !supportsContentRange) {
		throw new Error(
			'Content-Range header is not supported by the reader, but was asked to seek',
		);
	}

	if (seekTo > contentLength) {
		throw new Error(`Unexpected seek: ${seekTo} > ${contentLength}`);
	}

	if (
		skippingAhead &&
		iterator.counter.getOffset() + iterator.bytesRemaining() >= seekTo
	) {
		Log.verbose(
			logLevel,
			`Skipping over video data from position ${iterator.counter.getOffset()} -> ${seekTo}. Data already fetched`,
		);
		iterator.discard(seekTo - iterator.counter.getOffset());
		return currentReader;
	}

	if (skippingAhead && !supportsContentRange) {
		Log.verbose(
			logLevel,
			`Skipping over video data from position ${iterator.counter.getOffset()} -> ${seekTo}. Fetching but not reading all the data inbetween because Content-Range is not supported`,
		);
		iterator.discard(seekTo - iterator.counter.getOffset());
		return currentReader;
	}

	const time = Date.now();
	Log.verbose(
		logLevel,
		`Skipping over video data from position ${iterator.counter.getOffset()} -> ${seekTo}. Re-reading because this portion is not available`,
	);
	currentReader.abort();

	const {reader: newReader} = await readerInterface.read(src, seekTo, signal);
	iterator.skipTo(seekTo);
	Log.verbose(
		logLevel,
		`Re-reading took ${Date.now() - time}ms. New position: ${iterator.counter.getOffset()}`,
	);
	return newReader;
};
