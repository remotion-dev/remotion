import {Log} from './log';
import type {ParserState} from './state/parser-state';

export const performSeek = async ({
	seekTo,
	state,
}: {
	seekTo: number;
	state: ParserState;
}) => {
	const {iterator, logLevel, mode, contentLength} = state;

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
		return state.currentReader;
	}

	if (mode === 'download') {
		Log.verbose(
			logLevel,
			`Skipping over video data from position ${iterator.counter.getOffset()} -> ${seekTo}. Fetching but not reading all the data inbetween because in download mode`,
		);
		iterator.discard(seekTo - iterator.counter.getOffset());
		return state.currentReader;
	}

	const time = Date.now();
	Log.verbose(
		logLevel,
		`Skipping over video data from position ${iterator.counter.getOffset()} -> ${seekTo}. Re-reading because this portion is not available`,
	);
	state.currentReader.abort();

	await state.controller?._internals.checkForAbortAndPause();
	const {reader: newReader} = await state.readerInterface.read({
		src: state.src,
		range: seekTo,
		controller: state.controller,
	});
	iterator.skipTo(seekTo);
	await state.discardReadBytes(true);

	Log.verbose(
		logLevel,
		`Re-reading took ${Date.now() - time}ms. New position: ${iterator.counter.getOffset()}`,
	);
	state.currentReader = newReader;
};
