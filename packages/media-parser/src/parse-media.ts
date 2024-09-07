/* eslint-disable max-depth */
import type {BufferIterator} from './buffer-iterator';
import {getArrayBufferIterator} from './buffer-iterator';
import {emitAvailableInfo} from './emit-available-info';
import {getAvailableInfo} from './has-all-info';
import type {
	AllParseMediaFields,
	ParseMedia,
	ParseMediaCallbacks,
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
	const {reader, contentLength, name} = await readerInterface.read(
		src,
		null,
		signal,
	);
	let currentReader = reader;

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
	};

	while (parseResult === null || parseResult.status === 'incomplete') {
		if (signal?.aborted) {
			throw new Error('Aborted');
		}

		const result = await currentReader.read();

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
			if (!currentReader.closed) {
				currentReader.cancel(new Error('has all information'));
			}

			break;
		}

		if (
			parseResult &&
			parseResult.status === 'incomplete' &&
			parseResult.skipTo !== null
		) {
			if (!currentReader.closed) {
				currentReader.cancel(new Error('skipped ahead'));
			}

			const {reader: newReader} = await readerInterface.read(
				src,
				parseResult.skipTo,
				signal,
			);
			currentReader = newReader;
			iterator.skipTo(parseResult.skipTo);
		}
	}

	// Force assign
	emitAvailableInfo({
		hasInfo: {
			boxes: true,
			durationInSeconds: true,
			dimensions: true,
			fps: true,
			videoCodec: true,
			audioCodec: true,
			tracks: true,
			rotation: true,
			unrotatedDimensions: true,
			internalStats: true,
			size: true,
			name: true,
			container: true,
		},
		moreFields,
		parseResult,
		state,
		returnValue,
		contentLength,
		name,
	});

	currentReader.cancel(new Error('Do not need more information'));

	iterator?.destroy();
	return returnValue;
};
