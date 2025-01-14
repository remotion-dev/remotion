import type {BufferIterator} from './buffer-iterator';
import {getArrayBufferIterator} from './buffer-iterator';
import {emitAvailableInfo} from './emit-available-info';
import {getFieldsFromCallback} from './get-fields-from-callbacks';
import {getAvailableInfo, hasAllInfo} from './has-all-info';
import {Log} from './log';
import type {
	AllParseMediaFields,
	Options,
	ParseMedia,
	ParseMediaCallbacks,
	ParseMediaFields,
	ParseMediaOptions,
	ParseMediaResult,
} from './options';
import type {ParseResult} from './parse-result';
import {parseVideo} from './parse-video';
import {fetchReader} from './readers/from-fetch';
import {makeParserState} from './state/parser-state';

export const parseMedia: ParseMedia = async function <
	F extends Options<ParseMediaFields>,
>({
	src,
	fields: _fieldsInReturnValue,
	reader: readerInterface = fetchReader,
	onAudioTrack,
	onVideoTrack,
	signal,
	logLevel = 'info',
	onParseProgress,
	...more
}: ParseMediaOptions<F>) {
	let parseResult: ParseResult | null = null;

	const fieldsInReturnValue = _fieldsInReturnValue ?? {};

	const fields = getFieldsFromCallback({
		fields: fieldsInReturnValue,
		callbacks: more,
	});

	const {
		reader,
		contentLength,
		name,
		contentType,
		supportsContentRange: readerSupportsContentRange,
	} = await readerInterface.read(src, null, signal);
	const iterator: BufferIterator = getArrayBufferIterator(
		new Uint8Array([]),
		contentLength ?? 1_000_000_000,
	);

	const supportsContentRange =
		readerSupportsContentRange &&
		!(
			typeof process !== 'undefined' &&
			typeof process.env !== 'undefined' &&
			process.env.DISABLE_CONTENT_RANGE === 'true'
		);

	const state = makeParserState({
		hasAudioTrackHandlers: Boolean(onAudioTrack),
		hasVideoTrackHandlers: Boolean(onVideoTrack),
		signal,
		getIterator: () => iterator,
		fields,
		onAudioTrack: onAudioTrack ?? null,
		onVideoTrack: onVideoTrack ?? null,
		supportsContentRange,
	});

	let currentReader = reader;

	const returnValue = {} as ParseMediaResult<AllParseMediaFields>;
	const moreFields = more as ParseMediaCallbacks;

	const triggerInfoEmit = () => {
		const availableInfo = getAvailableInfo({
			fieldsToFetch: fields,
			state,
		});
		emitAvailableInfo({
			hasInfo: availableInfo,
			callbacks: moreFields,
			fieldsInReturnValue,
			parseResult,
			state,
			returnValue,
			contentLength,
			name,
			mimeType: contentType,
		});
	};

	triggerInfoEmit();

	while (parseResult === null || parseResult.status === 'incomplete') {
		if (signal?.aborted) {
			throw new Error('Aborted');
		}

		let stopped = false;

		while (iterator.bytesRemaining() <= 0 || !stopped) {
			const result = await currentReader.reader.read();

			if (result.value) {
				iterator.addData(result.value);
			}

			if (result.done) {
				break;
			}

			stopped = true;
		}

		await onParseProgress?.({
			bytes: iterator.counter.getOffset(),
			percentage: contentLength
				? iterator.counter.getOffset() / contentLength
				: null,
			totalBytes: contentLength,
		});
		triggerInfoEmit();

		if (parseResult && parseResult.status === 'incomplete') {
			Log.trace(
				logLevel,
				'Continuing parsing of file, currently at position',
				iterator.counter.getOffset(),
			);
			parseResult = await parseResult.continueParsing();
		} else {
			parseResult = await parseVideo({
				iterator,
				state,
				signal: signal ?? null,
				logLevel,
				fields,
				mimeType: contentType,
				contentLength,
				name,
			});
		}

		if (parseResult.status === 'incomplete' && parseResult.skipTo !== null) {
			state.increaseSkippedBytes(
				parseResult.skipTo - iterator.counter.getOffset(),
			);
		}

		if (
			hasAllInfo({
				fields,
				state,
			})
		) {
			Log.verbose(logLevel, 'Got all info, skipping to the end.');
			if (contentLength !== null) {
				state.increaseSkippedBytes(
					contentLength - iterator.counter.getOffset(),
				);
			}

			break;
		}

		if (parseResult.status === 'incomplete' && parseResult.skipTo !== null) {
			if (!supportsContentRange) {
				throw new Error(
					'Content-Range header is not supported by the reader, but was asked to seek',
				);
			}

			if (parseResult.skipTo === contentLength) {
				Log.verbose(logLevel, 'Skipped to end of file, not fetching.');
				break;
			}

			Log.verbose(
				logLevel,
				`Skipping over video data from position ${iterator.counter.getOffset()} -> ${parseResult.skipTo}`,
			);

			currentReader.abort();

			const {reader: newReader} = await readerInterface.read(
				src,
				parseResult.skipTo,
				signal,
			);
			currentReader = newReader;
			iterator.skipTo(parseResult.skipTo, true);
		}
	}

	Log.verbose(logLevel, 'Finished parsing file');

	// Force assign
	emitAvailableInfo({
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
		parseResult,
		state,
		returnValue,
		contentLength,
		mimeType: contentType,
		name,
	});

	currentReader.abort();
	iterator?.destroy();

	state.callbacks.tracks.ensureHasTracksAtEnd();
	return returnValue as ParseMediaResult<F>;
};
