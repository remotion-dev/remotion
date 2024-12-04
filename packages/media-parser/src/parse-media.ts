import type {BufferIterator} from './buffer-iterator';
import {getArrayBufferIterator} from './buffer-iterator';
import {emitAvailableInfo} from './emit-available-info';
import {getAvailableInfo, hasAllInfo} from './has-all-info';
import {Log} from './log';
import type {
	AllParseMediaFields,
	Options,
	ParseMedia,
	ParseMediaCallbacks,
	ParseMediaFields,
	ParseMediaResult,
} from './options';
import type {ParseResult, Structure} from './parse-result';
import {parseVideo} from './parse-video';
import type {ParserContext} from './parser-context';
import {fetchReader} from './readers/from-fetch';
import {makeParserState} from './state/parser-state';

export const parseMedia: ParseMedia = async ({
	src,
	fields,
	reader: readerInterface = fetchReader,
	onAudioTrack,
	onVideoTrack,
	signal,
	logLevel = 'info',
	onParseProgress,
	...more
}) => {
	let iterator: BufferIterator | null = null;
	let parseResult: ParseResult<Structure> | null = null;

	const state = makeParserState({
		hasAudioTrackHandlers: Boolean(onAudioTrack),
		hasVideoTrackHandlers: Boolean(onVideoTrack),
		signal,
		getIterator: () => iterator,
		fields: fields ?? {},
	});
	const {
		reader,
		contentLength,
		name,
		supportsContentRange: readerSupportsContentRange,
	} = await readerInterface.read(src, null, signal);
	let currentReader = reader;

	const supportsContentRange =
		readerSupportsContentRange &&
		!(
			typeof process !== 'undefined' &&
			typeof process.env !== 'undefined' &&
			process.env.DISABLE_CONTENT_RANGE === 'true'
		);

	const returnValue = {} as ParseMediaResult<AllParseMediaFields>;
	const moreFields = more as ParseMediaCallbacks<AllParseMediaFields>;

	const options: ParserContext = {
		onAudioTrack: onAudioTrack ?? null,
		onVideoTrack: onVideoTrack ?? null,
		parserState: state,
		nullifySamples: !(
			typeof process !== 'undefined' &&
			typeof process.env !== 'undefined' &&
			process.env.KEEP_SAMPLES === 'true'
		),
		supportsContentRange,
		nextTrackIndex: 0,
	};

	const triggerInfoEmit = () => {
		const availableInfo = getAvailableInfo(
			fields ?? {},
			parseResult?.segments ?? null,
			state,
		);
		emitAvailableInfo({
			hasInfo: availableInfo,
			moreFields,
			parseResult,
			state,
			returnValue,
			contentLength,
			name,
		});
	};

	triggerInfoEmit();

	while (parseResult === null || parseResult.status === 'incomplete') {
		if (signal?.aborted) {
			throw new Error('Aborted');
		}

		while (true) {
			const result = await currentReader.reader.read();

			if (iterator) {
				if (!result.done) {
					iterator.addData(result.value);
				}
			} else {
				if (result.done) {
					throw new Error('Unexpectedly reached EOF');
				}

				iterator = getArrayBufferIterator(
					result.value,
					contentLength ?? 1_000_000_000,
				);
			}

			if (iterator.bytesRemaining() >= 0) {
				break;
			}

			if (result.done) {
				break;
			}
		}

		if (!iterator) {
			throw new Error('Unexpected null');
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
			Log.verbose(
				logLevel,
				'Continuing parsing of file, currently at position',
				iterator.counter.getOffset(),
			);
			parseResult = await parseResult.continueParsing();
		} else {
			parseResult = await parseVideo({
				iterator,
				options,
				signal: signal ?? null,
				logLevel,
				fields: fields ?? {},
			});
		}

		if (parseResult.status === 'incomplete' && parseResult.skipTo !== null) {
			state.increaseSkippedBytes(
				parseResult.skipTo - iterator.counter.getOffset(),
			);
		}

		if (
			hasAllInfo({
				fields: fields ?? {},
				structure: parseResult.segments,
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
			Object.keys(fields ?? {}) as (keyof Options<ParseMediaFields>)[]
		).reduce(
			(acc, key) => {
				if (fields?.[key]) {
					acc[key] = true;
				}

				return acc;
			},
			{} as Record<keyof Options<ParseMediaFields>, boolean>,
		),
		moreFields,
		parseResult,
		state,
		returnValue,
		contentLength,
		name,
	});

	currentReader.abort();
	iterator?.destroy();

	state.tracks.ensureHasTracksAtEnd();
	return returnValue;
};
