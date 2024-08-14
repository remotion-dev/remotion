/* eslint-disable max-depth */
import {addNewMatroskaTracks as emitNewMatroskaTracks} from './add-new-matroska-tracks';
import {getTracksFromMatroska} from './boxes/webm/get-ready-tracks';
import {getMainSegment} from './boxes/webm/traversal';
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
}) => {
	const {reader, contentLength} = await readerInterface.read(src, null);
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

	const state = makeParserState({
		hasAudioCallbacks: onAudioTrack !== null,
		hasVideoCallbacks: onVideoTrack !== null,
	});

	const options: ParserContext = {
		canSkipVideoData: !(onAudioTrack || onVideoTrack),
		onAudioTrack: onAudioTrack ?? null,
		onVideoTrack: onVideoTrack ?? null,
		parserState: state,
	};

	while (parseResult === null || parseResult.status === 'incomplete') {
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
				contentLength ?? undefined,
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

		const matroskaSegment = getMainSegment(parseResult.segments);

		if (matroskaSegment) {
			const potentialTracks = getTracksFromMatroska(matroskaSegment);
			await emitNewMatroskaTracks(potentialTracks, state, options);
		}

		// TODO Better: Check if no active listeners are registered
		// Also maybe check for canSkipVideoData
		if (
			hasAllInfo(fields ?? {}, parseResult) &&
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
			);
			currentReader = newReader;
			iterator.skipTo(parseResult.skipTo);
		}
	}

	if (!parseResult) {
		throw new Error('Could not parse video');
	}

	if (fields?.dimensions) {
		const dimensions = getDimensions(parseResult.segments);
		returnValue.dimensions = {
			width: dimensions.width,
			height: dimensions.height,
		};
	}

	if (fields?.unrotatedDimension) {
		const dimensions = getDimensions(parseResult.segments);
		returnValue.unrotatedDimension = {
			width: dimensions.unrotatedWidth,
			height: dimensions.unrotatedHeight,
		};
	}

	if (fields?.rotation) {
		const dimensions = getDimensions(parseResult.segments);
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
		const {audioTracks, videoTracks} = getTracks(parseResult.segments);
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
