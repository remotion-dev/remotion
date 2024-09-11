/* eslint-disable max-depth */
import type {BufferIterator} from './buffer-iterator';
import {getArrayBufferIterator} from './buffer-iterator';
import {emitAvailableInfo} from './emit-available-info';
import {getAvailableInfo} from './has-all-info';
import type {
	AllParseMediaFields,
	Options,
	ParseMedia,
	ParseMediaCallbacks,
	ParseMediaFields,
	ParseMediaResult,
} from './options';
import type {ParseResult} from './parse-result';
import {parseVideo} from './parse-video';
import type {ParserContext} from './parser-context';
import {makeParserState} from './parser-state';
import {fetchReader} from './readers/from-fetch';

export const parseMedia: ParseMedia = async ({
	src,
	fields,
	reader: readerInterface = fetchReader,
	onAudioTrack,
	onVideoTrack,
	signal,
	...more
}) => {
	const state = makeParserState({
		hasAudioCallbacks: onAudioTrack !== null,
		hasVideoCallbacks: onVideoTrack !== null,
		signal,
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

	let iterator: BufferIterator | null = null;
	let parseResult: ParseResult | null = null;

	const options: ParserContext = {
		canSkipVideoData: !(onAudioTrack || onVideoTrack),
		onAudioTrack: onAudioTrack ?? null,
		onVideoTrack: onVideoTrack ?? null,
		parserState: state,
		nullifySamples: !(
			typeof process !== 'undefined' &&
			typeof process.env !== 'undefined' &&
			process.env.KEEP_SAMPLES === 'true'
		),
		supportsContentRange,
	};

	while (parseResult === null || parseResult.status === 'incomplete') {
		if (signal?.aborted) {
			throw new Error('Aborted');
		}

		// eslint-disable-next-line no-constant-condition
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

		if (parseResult && parseResult.status === 'incomplete') {
			parseResult = await parseResult.continueParsing();
		} else {
			parseResult = await parseVideo({
				iterator,
				options,
				signal: signal ?? null,
			});
		}

		const availableInfo = getAvailableInfo(fields ?? {}, parseResult, state);
		const hasAllInfo = Object.values(availableInfo).every(Boolean);

		emitAvailableInfo({
			hasInfo: availableInfo,
			moreFields,
			parseResult,
			state,
			returnValue,
			contentLength,
			name,
		});

		// TODO Better: Check if no active listeners are registered
		// Also maybe check for canSkipVideoData
		if (hasAllInfo && !onVideoTrack && !onAudioTrack) {
			break;
		}

		if (
			parseResult &&
			parseResult.status === 'incomplete' &&
			parseResult.skipTo !== null
		) {
			if (!supportsContentRange) {
				throw new Error(
					'Content-Range header is not supported by the reader, but was asked to seek',
				);
			}

			const {reader: newReader} = await readerInterface.read(
				src,
				parseResult.skipTo,
				signal,
			);
			currentReader = newReader;
			iterator.skipTo(parseResult.skipTo, true);
		}
	}

	// Force assign
	emitAvailableInfo({
		hasInfo: (
			Object.keys(fields ?? {}) as (keyof Options<ParseMediaFields>)[]
		).reduce(
			(acc, key) => {
				acc[key] = true;
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
	return returnValue;
};
