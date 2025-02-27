import {emitAvailableInfo} from './emit-available-info';
import {getFieldsFromCallback} from './get-fields-from-callbacks';
import {getAvailableInfo, hasAllInfo} from './has-all-info';
import {Log} from './log';
import {mediaParserController} from './media-parser-controller';
import type {
	AllParseMediaFields,
	InternalParseMedia,
	InternalParseMediaOptions,
	Options,
	ParseMediaCallbacks,
	ParseMediaFields,
	ParseMediaResult,
} from './options';
import {performSeek} from './perform-seek';
import {warnIfRemotionLicenseNotAcknowledged} from './remotion-license-acknowledge';
import {runParseIteration} from './run-parse-iteration';
import {makeParserState} from './state/parser-state';
import {throttledStateUpdate} from './throttled-progress';

export const internalParseMedia: InternalParseMedia = async function <
	F extends Options<ParseMediaFields>,
>({
	src,
	fields: _fieldsInReturnValue,
	reader: readerInterface,
	onAudioTrack,
	onVideoTrack,
	controller = mediaParserController(),
	logLevel,
	onParseProgress: onParseProgressDoNotCallDirectly,
	progressIntervalInMs,
	mode,
	onDiscardedData,
	onError,
	acknowledgeRemotionLicense,
	apiName,
	selectM3uStream: selectM3uStreamFn,
	selectM3uAssociatedPlaylists: selectM3uAssociatedPlaylistsFn,
	...more
}: InternalParseMediaOptions<F>) {
	warnIfRemotionLicenseNotAcknowledged({
		acknowledgeRemotionLicense,
		logLevel,
		apiName,
	});
	const fieldsInReturnValue = _fieldsInReturnValue ?? {};

	const fields = getFieldsFromCallback({
		fields: fieldsInReturnValue,
		callbacks: more,
	});

	Log.verbose(logLevel, `Reading ${typeof src === 'string' ? src : src.name}`);

	const {
		reader: readerInstance,
		contentLength,
		name,
		contentType,
		supportsContentRange,
		needsContentRange,
	} = await readerInterface.read({src, range: null, controller});

	if (contentLength === null) {
		throw new Error(
			`Cannot read media ${src} without a content length. This is currently not supported. Ensure the media has a "Content-Length" HTTP header.`,
		);
	}

	if (!supportsContentRange && needsContentRange) {
		throw new Error(
			'Cannot read media without it supporting the "Content-Range" header. This is currently not supported. Ensure the media supports the "Content-Range" HTTP header.',
		);
	}

	const hasAudioTrackHandlers = Boolean(onAudioTrack);
	const hasVideoTrackHandlers = Boolean(onVideoTrack);

	if (
		!hasAudioTrackHandlers &&
		!hasVideoTrackHandlers &&
		Object.values(fields).every((v) => !v) &&
		mode === 'query'
	) {
		Log.warn(
			logLevel,
			new Error(
				'Warning - No `fields` and no `on*` callbacks were passed to `parseMedia()`. Specify the data you would like to retrieve.',
			),
		);
	}

	let timeIterating = 0;
	let timeReadingData = 0;
	let timeSeeking = 0;
	let timeCheckingIfDone = 0;
	let timeFreeingData = 0;
	let errored: Error | null = null;

	const state = makeParserState({
		hasAudioTrackHandlers,
		hasVideoTrackHandlers,
		controller,
		fields,
		onAudioTrack: onAudioTrack ?? null,
		onVideoTrack: onVideoTrack ?? null,
		contentLength,
		logLevel,
		mode,
		readerInterface,
		src,
		onDiscardedData,
		selectM3uStreamFn,
		selectM3uAssociatedPlaylistsFn,
	});
	const {iterator} = state;

	let currentReader = readerInstance;

	const returnValue = {} as ParseMediaResult<AllParseMediaFields>;
	const moreFields = more as ParseMediaCallbacks;

	const throttledState = throttledStateUpdate({
		updateFn: onParseProgressDoNotCallDirectly ?? null,
		everyMilliseconds: progressIntervalInMs ?? 100,
		controller,
		totalBytes: contentLength,
	});

	const triggerInfoEmit = async () => {
		const availableInfo = getAvailableInfo({
			fieldsToFetch: fields,
			state,
		});
		await emitAvailableInfo({
			hasInfo: availableInfo,
			callbacks: moreFields,
			fieldsInReturnValue,
			state,
			returnValue,
			name,
			mimeType: contentType,
		});
	};

	const checkIfDone = async () => {
		const startCheck = Date.now();
		const hasAll = hasAllInfo({
			fields,
			state,
		});
		timeCheckingIfDone += Date.now() - startCheck;

		if (hasAll && mode === 'query') {
			Log.verbose(logLevel, 'Got all info, skipping to the end.');
			state.increaseSkippedBytes(
				contentLength - state.iterator.counter.getOffset(),
			);

			return true;
		}

		if (state.iterator.counter.getOffset() === contentLength) {
			if (
				state.getStructure().type === 'm3u' &&
				!state.m3u.getAllChunksProcessedOverall()
			) {
				return false;
			}

			Log.verbose(logLevel, 'Reached end of file');
			await state.discardReadBytes(true);

			return true;
		}

		if (
			state.iterator.counter.getOffset() + state.iterator.bytesRemaining() ===
				contentLength &&
			errored
		) {
			Log.verbose(logLevel, 'Reached end of file and errorred');
			return true;
		}

		return false;
	};

	await triggerInfoEmit();

	let iterationWithThisOffset = 0;
	while (!(await checkIfDone())) {
		await controller._internals.checkForAbortAndPause();

		const offsetBefore = iterator.counter.getOffset();

		const fetchMoreData = async () => {
			await controller._internals.checkForAbortAndPause();
			const result = await currentReader.reader.read();
			if (result.value) {
				iterator.addData(result.value);
			}

			return result.done;
		};

		const readStart = Date.now();
		while (iterator.bytesRemaining() < 0) {
			const done = await fetchMoreData();
			if (done) {
				break;
			}
		}

		const hasBigBuffer = iterator.bytesRemaining() > 100_000;

		if (iterationWithThisOffset > 0 || !hasBigBuffer) {
			await fetchMoreData();
		}

		await state.eventLoop.eventLoopBreakIfNeeded();

		timeReadingData += Date.now() - readStart;

		throttledState.update?.(() => ({
			bytes: iterator.counter.getOffset(),
			percentage: contentLength
				? iterator.counter.getOffset() / contentLength
				: null,
			totalBytes: contentLength,
		}));

		if (!errored) {
			Log.trace(
				logLevel,
				`Continuing parsing of file, currently at position ${iterator.counter.getOffset()}/${contentLength} (0x${iterator.counter.getOffset().toString(16)})`,
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
				await triggerInfoEmit();
				const start = Date.now();

				await controller._internals.checkForAbortAndPause();
				const skip = await runParseIteration({
					state,
					mimeType: contentType,
					contentLength,
					name,
				});
				timeIterating += Date.now() - start;

				if (skip !== null) {
					state.increaseSkippedBytes(
						skip.skipTo - iterator.counter.getOffset(),
					);
					if (skip.skipTo === contentLength) {
						Log.verbose(logLevel, 'Skipped to end of file, not fetching.');
						break;
					}

					const seekStart = Date.now();
					currentReader = await performSeek({
						seekTo: skip.skipTo,
						currentReader,
						readerInterface,
						src,
						state,
					});
					timeSeeking += Date.now() - seekStart;
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
					errored = e as Error;
					Log.verbose(
						logLevel,
						'Error was handled by onError and deciding to continue.',
					);
				}
			}

			const didProgress = iterator.counter.getOffset() > offsetBefore;
			if (!didProgress) {
				iterationWithThisOffset++;
			} else {
				iterationWithThisOffset = 0;
			}
		}

		const timeFreeStart = Date.now();
		await state.discardReadBytes(false);

		timeFreeingData += Date.now() - timeFreeStart;
	}

	Log.verbose(logLevel, 'Finished parsing file');

	// Force assign
	await emitAvailableInfo({
		hasInfo: (
			Object.keys(fields) as (keyof Options<ParseMediaFields>)[]
		).reduce(
			(acc, key) => {
				if (fields?.[key]) {
					acc[key] = true;
				}

				return acc;
			},
			{} as Record<keyof Options<ParseMediaFields>, boolean>,
		),
		callbacks: moreFields,
		fieldsInReturnValue,
		state,
		returnValue,
		mimeType: contentType,
		name,
	});

	Log.verbose(logLevel, `Time iterating over file: ${timeIterating}ms`);
	Log.verbose(logLevel, `Time fetching data: ${timeReadingData}ms`);
	Log.verbose(logLevel, `Time seeking: ${timeSeeking}ms`);
	Log.verbose(logLevel, `Time checking if done: ${timeCheckingIfDone}ms`);
	Log.verbose(logLevel, `Time freeing data: ${timeFreeingData}ms`);

	currentReader.abort();
	iterator?.destroy();

	state.callbacks.tracks.ensureHasTracksAtEnd(fields);
	state.m3u.abortM3UStreamRuns();
	if (errored) {
		throw errored;
	}

	return returnValue as ParseMediaResult<F>;
};
