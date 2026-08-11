import {checkIfDone} from './check-if-done';
import {triggerInfoEmit} from './emit-all-info';
import {Log} from './log';
import {makeProgressObject} from './make-progress-object';
import type {ParseMediaOnError} from './options';
import {performSeek} from './perform-seek';
import {runParseIteration} from './run-parse-iteration';
import type {ParserState} from './state/parser-state';
import type {ThrottledState} from './throttled-progress';
import {
	getWorkOnSeekRequestOptions,
	workOnSeekRequest,
} from './work-on-seek-request';

const fetchMoreData = async (state: ParserState) => {
	await state.controller._internals.checkForAbortAndPause();
	const result = await state.currentReader.getCurrent().reader.read();
	if (result.value) {
		state.iterator.addData(result.value);
	}

	return result.done;
};

export const parseLoop = async ({
	state,
	throttledState,
	onError,
}: {
	state: ParserState;
	throttledState: ThrottledState;
	onError: ParseMediaOnError;
}) => {
	let iterationWithThisOffset = 0;

	while (!(await checkIfDone(state))) {
		await state.controller._internals.checkForAbortAndPause();

		await workOnSeekRequest(getWorkOnSeekRequestOptions(state));

		const offsetBefore = state.iterator.counter.getOffset();

		const readStart = Date.now();
		while (state.iterator.bytesRemaining() < 0) {
			const done = await fetchMoreData(state);
			if (done) {
				break;
			}
		}

		if (
			iterationWithThisOffset > 0 ||
			state.iterator.bytesRemaining() <= 100_000
		) {
			await fetchMoreData(state);
		}

		state.timings.timeReadingData += Date.now() - readStart;

		throttledState.update?.(() => makeProgressObject(state));

		if (!state.errored) {
			Log.trace(
				state.logLevel,
				`Continuing parsing of file, currently at position ${state.iterator.counter.getOffset()}/${state.contentLength} (0x${state.iterator.counter.getOffset().toString(16)})`,
			);

			if (
				iterationWithThisOffset > 300 &&
				state.structure.getStructure().type !== 'm3u'
			) {
				throw new Error(
					'Infinite loop detected. The parser is not progressing. This is likely a bug in the parser. You can report this at https://remotion.dev/report and we will fix it as soon as possible.',
				);
			}

			try {
				await triggerInfoEmit(state);

				await state.controller._internals.checkForAbortAndPause();
				const parseLoopStart = Date.now();
				const result = await runParseIteration({
					state,
				});
				state.timings.timeInParseLoop += Date.now() - parseLoopStart;

				if (result !== null && result.action === 'fetch-more-data') {
					Log.verbose(
						state.logLevel,
						`Need to fetch ${result.bytesNeeded} more bytes before we can continue`,
					);
					const startBytesRemaining = state.iterator.bytesRemaining();
					while (true) {
						const done = await fetchMoreData(state);
						if (done) {
							break;
						}

						if (
							state.iterator.bytesRemaining() - startBytesRemaining >=
							result.bytesNeeded
						) {
							break;
						}
					}

					continue;
				}

				if (result !== null && result.action === 'skip') {
					state.increaseSkippedBytes(
						result.skipTo - state.iterator.counter.getOffset(),
					);
					if (result.skipTo === state.contentLength) {
						state.iterator.discard(
							result.skipTo - state.iterator.counter.getOffset(),
						);
						Log.verbose(
							state.logLevel,
							'Skipped to end of file, not fetching.',
						);
						break;
					}

					const seekStart = Date.now();
					await performSeek({
						seekTo: result.skipTo,
						userInitiated: false,
						controller: state.controller,
						mediaSection: state.mediaSection,
						iterator: state.iterator,
						logLevel: state.logLevel,
						mode: state.mode,
						contentLength: state.contentLength,
						seekInfiniteLoop: state.seekInfiniteLoop,
						currentReader: state.currentReader,
						readerInterface: state.readerInterface,
						fields: state.fields,
						src: state.src,
						discardReadBytes: state.discardReadBytes,
						prefetchCache: state.prefetchCache,
						isoState: state.iso,
					});
					state.timings.timeSeeking += Date.now() - seekStart;
				}
			} catch (e) {
				const err = await onError(e as Error);
				if (!err.action) {
					throw new Error(
						'onError was used but did not return an "action" field. See docs for this API on how to use onError.',
					);
				}

				if (err.action === 'fail') {
					throw e;
				}

				if (err.action === 'download') {
					state.errored = e as Error;
					Log.verbose(
						state.logLevel,
						'Error was handled by onError and deciding to continue.',
					);
				}
			}
		}

		const timeFreeStart = Date.now();
		await state.discardReadBytes(false);
		state.timings.timeFreeingData += Date.now() - timeFreeStart;

		const didProgress = state.iterator.counter.getOffset() > offsetBefore;
		if (!didProgress) {
			iterationWithThisOffset++;
		} else {
			iterationWithThisOffset = 0;
		}
	}

	state.samplesObserved.setLastSampleObserved();
	await state.callbacks.callTracksDoneCallback();

	// After the last sample, you might queue a last seek again.
	if (state.controller._internals.seekSignal.getSeek() !== null) {
		Log.verbose(
			state.logLevel,
			'Reached end of samples, but there is a pending seek. Trying to seek...',
		);
		await workOnSeekRequest(getWorkOnSeekRequestOptions(state));
		if (state.controller._internals.seekSignal.getSeek() !== null) {
			throw new Error(
				'Reached the end of the file even though a seek was requested. This is likely a bug in the parser. You can report this at https://remotion.dev/report and we will fix it as soon as possible.',
			);
		}

		await parseLoop({
			onError,
			throttledState,
			state,
		});
	}
};
