/* eslint-disable max-depth */
import type {BufferIterator} from './buffer-iterator';
import {getArrayBufferIterator} from './buffer-iterator';
import {fetchReader} from './from-fetch';
import {getAudioCodec} from './get-audio-codec';
import {getDimensions} from './get-dimensions';
import {getDuration} from './get-duration';
import {getFps} from './get-fps';
import {getTracks} from './get-tracks';
import {getVideoCodec} from './get-video-codec';
import {hasAllInfo} from './has-all-info';
import type {Metadata, ParseMedia} from './options';
import type {ParseResult} from './parse-result';
import {parseVideo} from './parse-video';
import type {ParserContext} from './parser-context';
import {makeParserState} from './parser-state';

export const parseMedia: ParseMedia = async ({
	src,
	fields,
	reader: readerInterface = fetchReader,
	onAudioTrack,
	onVideoTrack,
	signal,
}) => {
	const state = makeParserState({
		hasAudioCallbacks: onAudioTrack !== null,
		hasVideoCallbacks: onVideoTrack !== null,
		signal,
	});
	const {reader, contentLength} = await readerInterface.read(src, null, signal);
	let currentReader = reader;

	const returnValue = {} as Metadata<
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		true
	>;

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
			});
		}

		// TODO Better: Check if no active listeners are registered
		// Also maybe check for canSkipVideoData
		if (
			hasAllInfo(fields ?? {}, parseResult, state) &&
			!onVideoTrack &&
			!onAudioTrack
		) {
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

	if (!parseResult) {
		throw new Error('Could not parse video');
	}

	if (fields?.dimensions) {
		const dimensions = getDimensions(parseResult.segments, state);
		returnValue.dimensions = {
			width: dimensions.width,
			height: dimensions.height,
		};
	}

	if (fields?.unrotatedDimensions) {
		const dimensions = getDimensions(parseResult.segments, state);
		returnValue.unrotatedDimensions = {
			width: dimensions.unrotatedWidth,
			height: dimensions.unrotatedHeight,
		};
	}

	if (fields?.rotation) {
		const dimensions = getDimensions(parseResult.segments, state);
		returnValue.rotation = dimensions.rotation;
	}

	if (fields?.durationInSeconds) {
		returnValue.durationInSeconds = getDuration(parseResult.segments);
	}

	if (fields?.fps) {
		returnValue.fps = getFps(parseResult.segments);
	}

	if (fields?.videoCodec) {
		returnValue.videoCodec = getVideoCodec(parseResult.segments);
	}

	if (fields?.audioCodec) {
		returnValue.audioCodec = getAudioCodec(parseResult.segments);
	}

	if (fields?.tracks) {
		const {audioTracks, videoTracks} = getTracks(parseResult.segments, state);
		returnValue.audioTracks = audioTracks;
		returnValue.videoTracks = videoTracks;
	}

	if (fields?.boxes) {
		returnValue.boxes = parseResult.segments;
	}

	if (fields?.internalStats) {
		returnValue.internalStats = state.getInternalStats();
	}

	iterator?.destroy();
	return returnValue;
};
