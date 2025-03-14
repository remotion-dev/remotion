import {checkIfDone} from './check-if-done';
import {triggerInfoEmit} from './emit-all-info';
import {Log} from './log';
import {makeProgressObject} from './make-progress-object';
import type {ParseMediaOnError} from './options';
import {performSeek} from './perform-seek';
import {runParseIteration} from './run-parse-iteration';
import type {ParserState} from './state/parser-state';
import type {ThrottledState} from './throttled-progress';

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
		const seek = state.controller._internals.seekSignal.getSeek();
		if (seek) {
			throw new Error('cannot seek, not implemented');
		}

		const offsetBefore = state.iterator.counter.getOffset();

		const fetchMoreData = async () => {
			await state.controller._internals.checkForAbortAndPause();
			const result = await state.currentReader.reader.read();
			if (result.value) {
				state.iterator.addData(result.value);
			}

			return result.done;
		};

		const readStart = Date.now();
		while (state.iterator.bytesRemaining() < 0) {
			const done = await fetchMoreData();
			if (done) {
				break;
			}
		}

		const hasBigBuffer = state.iterator.bytesRemaining() > 100_000;

		if (iterationWithThisOffset > 0 || !hasBigBuffer) {
			await fetchMoreData();
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
				state.getStructure().type !== 'm3u'
			) {
				throw new Error(
					'Infinite loop detected. The parser is not progressing. This is likely a bug in the parser. You can report this at https://remotion.dev/report and we will fix it as soon as possible.',
				);
			}

			try {
				await triggerInfoEmit(state);
				const start = Date.now();

				await state.controller._internals.checkForAbortAndPause();
				const skip = await runParseIteration({
					state,
				});
				state.timings.timeIterating += Date.now() - start;

				if (skip !== null) {
					state.increaseSkippedBytes(
						skip.skipTo - state.iterator.counter.getOffset(),
					);
					if (skip.skipTo === state.contentLength) {
						Log.verbose(
							state.logLevel,
							'Skipped to end of file, not fetching.',
						);
						break;
					}

					const seekStart = Date.now();
					state.currentReader = await performSeek({
						seekTo: skip.skipTo,
						state,
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

			const didProgress = state.iterator.counter.getOffset() > offsetBefore;
			if (!didProgress) {
				iterationWithThisOffset++;
			} else {
				iterationWithThisOffset = 0;
			}
		}

		const timeFreeStart = Date.now();
		await state.discardReadBytes(false);

		state.timings.timeFreeingData += Date.now() - timeFreeStart;
	}
};
