import type {MediaParserController} from './controller/media-parser-controller';
import type {PrefetchCache} from './fetch';
import type {BufferIterator} from './iterator/buffer-iterator';
import type {MediaParserLogLevel} from './log';
import {Log} from './log';
import type {ParseMediaSrc} from './options';
import type {MediaParserReaderInterface} from './readers/reader';
import type {CurrentReader} from './state/current-reader';

export const seekBackwards = async ({
	iterator,
	seekTo,
	readerInterface,
	src,
	controller,
	logLevel,
	currentReader,
	prefetchCache,
}: {
	iterator: BufferIterator;
	seekTo: number;
	readerInterface: MediaParserReaderInterface;
	src: ParseMediaSrc;
	controller: MediaParserController;
	logLevel: MediaParserLogLevel;
	currentReader: CurrentReader;
	prefetchCache: PrefetchCache;
}) => {
	// (a) data has not been discarded yet
	const howManyBytesWeCanGoBack = iterator.counter.getDiscardedOffset();

	if (iterator.counter.getOffset() - howManyBytesWeCanGoBack <= seekTo) {
		Log.verbose(logLevel, `Seeking back to ${seekTo}`);
		iterator.skipTo(seekTo);
		return;
	}

	// (b) data has been discarded, making new reader
	const time = Date.now();
	Log.verbose(
		logLevel,
		`Seeking in video from position ${iterator.counter.getOffset()} -> ${seekTo}. Re-reading because this portion is not available.`,
	);

	await currentReader.getCurrent().abort();

	const {reader: newReader} = await readerInterface.read({
		src,
		range: seekTo,
		controller,
		logLevel,
		prefetchCache,
	});

	iterator.replaceData(new Uint8Array([]), seekTo);

	Log.verbose(
		logLevel,
		`Re-reading took ${Date.now() - time}ms. New position: ${iterator.counter.getOffset()}`,
	);
	currentReader.setCurrent(newReader);
};
