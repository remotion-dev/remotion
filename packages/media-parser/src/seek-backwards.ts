import type {MediaParserController} from './controller/media-parser-controller';
import type {BufferIterator} from './iterator/buffer-iterator';
import type {LogLevel} from './log';
import {Log} from './log';
import type {ParseMediaSrc} from './options';
import type {ReaderInterface} from './readers/reader';
import type {CurrentReader} from './state/current-reader';

export const seekBackwards = async ({
	iterator,
	seekTo,
	readerInterface,
	src,
	controller,
	logLevel,
	currentReader,
}: {
	iterator: BufferIterator;
	seekTo: number;
	readerInterface: ReaderInterface;
	src: ParseMediaSrc;
	controller: MediaParserController;
	logLevel: LogLevel;
	currentReader: CurrentReader;
}) => {
	// (a) data has not been discarded yet
	const howManyBytesWeCanGoBack = iterator.counter.getDiscardedOffset();

	if (iterator.counter.getOffset() - howManyBytesWeCanGoBack <= seekTo) {
		iterator.skipTo(seekTo);
		return;
	}

	// (b) data has been discarded, making new reader
	const time = Date.now();
	Log.verbose(
		logLevel,
		`Seeking in video from position ${iterator.counter.getOffset()} -> ${seekTo}. Re-reading because this portion is not available.`,
	);

	const {reader: newReader} = await readerInterface.read({
		src,
		range: seekTo,
		controller,
		logLevel,
	});

	iterator.replaceData(new Uint8Array([]), seekTo);

	Log.verbose(
		logLevel,
		`Re-reading took ${Date.now() - time}ms. New position: ${iterator.counter.getOffset()}`,
	);
	currentReader.setCurrent(newReader);
};
