import {Log} from './log';
import type {ParserState} from './state/parser-state';

export const seekBackwards = async (state: ParserState, seekTo: number) => {
	const {iterator} = state;

	// (a) data has not been discarded yet
	const howManyBytesNotYetDiscarded = iterator.counter.getDiscardedOffset();
	const howManyBytesWeCanGoBack =
		iterator.counter.getOffset() - howManyBytesNotYetDiscarded;

	if (iterator.counter.getOffset() - howManyBytesWeCanGoBack <= seekTo) {
		iterator.skipTo(seekTo);
		return;
	}

	// (b) data has been discarded, making new reader
	const time = Date.now();
	Log.verbose(
		state.logLevel,
		`Seeking in video from position ${iterator.counter.getOffset()} -> ${seekTo}. Re-reading because this portion is not available`,
	);

	const {reader: newReader} = await state.readerInterface.read({
		src: state.src,
		range: seekTo,
		controller: state.controller,
	});

	iterator.replaceData(new Uint8Array([]), seekTo);

	Log.verbose(
		state.logLevel,
		`Re-reading took ${Date.now() - time}ms. New position: ${iterator.counter.getOffset()}`,
	);
	state.currentReader = newReader;
};
