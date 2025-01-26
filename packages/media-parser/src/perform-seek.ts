import {Log} from './log';
import type {ParseMediaSrc} from './options';
import type {Reader, ReaderInterface} from './readers/reader';
import type {ParserState} from './state/parser-state';

export const performSeek = async ({
	seekTo,
	state,
	currentReader,
	readerInterface,
	src,
}: {
	seekTo: number;
	state: ParserState;
	currentReader: Reader;
	readerInterface: ReaderInterface;
	src: ParseMediaSrc;
}): Promise<Reader> => {
	const {iterator, logLevel, controller, mode, contentLength} = state;

	if (seekTo <= iterator.counter.getOffset()) {
		throw new Error(
			`Seeking backwards is not supported. Current position: ${iterator.counter.getOffset()}, seekTo: ${seekTo}`,
		);
	}

	if (seekTo > state.contentLength) {
		throw new Error(`Unexpected seek: ${seekTo} > ${contentLength}`);
	}

	if (iterator.counter.getOffset() + iterator.bytesRemaining() >= seekTo) {
		Log.verbose(
			logLevel,
			`Skipping over video data from position ${iterator.counter.getOffset()} -> ${seekTo}. Data already fetched`,
		);
		iterator.discard(seekTo - iterator.counter.getOffset());
		return currentReader;
	}

	if (mode === 'download') {
		Log.verbose(
			logLevel,
			`Skipping over video data from position ${iterator.counter.getOffset()} -> ${seekTo}. Fetching but not reading all the data inbetween because in download mode`,
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

	await controller?._internals.checkForAbortAndPause();
	const {reader: newReader} = await readerInterface.read({
		src,
		range: seekTo,
		controller,
	});
	iterator.skipTo(seekTo);
	await state.discardReadBytes(true);

	Log.verbose(
		logLevel,
		`Re-reading took ${Date.now() - time}ms. New position: ${iterator.counter.getOffset()}`,
	);
	return newReader;
};
