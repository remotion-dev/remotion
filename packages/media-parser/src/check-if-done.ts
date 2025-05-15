import {hasAllInfo} from './has-all-info';
import {Log} from './log';
import type {ParserState} from './state/parser-state';

export const checkIfDone = async (state: ParserState) => {
	const startCheck = Date.now();
	const hasAll = hasAllInfo({
		state,
	});
	state.timings.timeCheckingIfDone += Date.now() - startCheck;

	if (hasAll && state.mode === 'query') {
		Log.verbose(state.logLevel, 'Got all info, skipping to the end.');
		state.increaseSkippedBytes(
			state.contentLength - state.iterator.counter.getOffset(),
		);

		return true;
	}

	if (state.iterator.counter.getOffset() === state.contentLength) {
		if (
			state.structure.getStructure().type === 'm3u' &&
			!state.m3u.getAllChunksProcessedOverall()
		) {
			return false;
		}

		state.riff.queuedBFrames.flush();
		if (state.riff.queuedBFrames.hasReleasedFrames()) {
			return false;
		}

		Log.verbose(state.logLevel, 'Reached end of file');
		await state.discardReadBytes(true);

		return true;
	}

	if (
		state.iterator.counter.getOffset() + state.iterator.bytesRemaining() ===
			state.contentLength &&
		state.errored
	) {
		Log.verbose(state.logLevel, 'Reached end of file and errorred');
		return true;
	}

	return false;
};
