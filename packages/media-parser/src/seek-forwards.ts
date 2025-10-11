import type {MediaParserController} from './controller/media-parser-controller';
import {disallowForwardSeekIfSamplesAreNeeded} from './disallow-forward-seek-if-samples-are-needed';
import type {PrefetchCache} from './fetch';
import type {AllOptions, ParseMediaFields} from './fields';
import type {BufferIterator} from './iterator/buffer-iterator';
import type {MediaParserLogLevel} from './log';
import {Log} from './log';
import type {ParseMediaSrc} from './options';
import type {MediaParserReaderInterface} from './readers/reader';
import type {CurrentReader} from './state/current-reader';

export const seekForward = async ({
	seekTo,
	userInitiated,
	iterator,
	fields,
	logLevel,
	currentReader,
	readerInterface,
	src,
	controller,
	discardReadBytes,
	prefetchCache,
}: {
	seekTo: number;
	userInitiated: boolean;
	iterator: BufferIterator;
	fields: Partial<AllOptions<ParseMediaFields>>;
	logLevel: MediaParserLogLevel;
	currentReader: CurrentReader;
	readerInterface: MediaParserReaderInterface;
	src: ParseMediaSrc;
	controller: MediaParserController;
	discardReadBytes: (force: boolean) => Promise<void>;
	prefetchCache: PrefetchCache;
}): Promise<void> => {
	if (userInitiated) {
		disallowForwardSeekIfSamplesAreNeeded({
			fields,
			seekTo,
			previousPosition: iterator.counter.getOffset(),
		});
	}

	const alreadyHasBuffer =
		iterator.bytesRemaining() >= seekTo - iterator.counter.getOffset();

	Log.verbose(
		logLevel,
		`Performing seek from ${iterator.counter.getOffset()} to ${seekTo}`,
	);

	// (a) starting byte has already been fetched

	if (alreadyHasBuffer) {
		iterator.skipTo(seekTo);
		Log.verbose(logLevel, `Already read ahead enough, skipping forward`);
		return;
	}

	// (b) starting byte has not been fetched yet, making new reader
	const time = Date.now();
	Log.verbose(
		logLevel,
		`Skipping over video data from position ${iterator.counter.getOffset()} -> ${seekTo}. Re-reading because this portion is not available`,
	);

	await currentReader.getCurrent().abort();

	const {reader: newReader} = await readerInterface.read({
		src,
		range: seekTo,
		controller,
		logLevel,
		prefetchCache,
	});
	iterator.skipTo(seekTo);
	await discardReadBytes(true);

	Log.verbose(
		logLevel,
		`Re-reading took ${Date.now() - time}ms. New position: ${iterator.counter.getOffset()}`,
	);
	currentReader.setCurrent(newReader);
};
