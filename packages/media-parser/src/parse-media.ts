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
import {makeParserState} from './parser-state';

export const parseMedia: ParseMedia = async ({
	src,
	fields,
	reader: readerInterface = fetchReader,
	onAudioSample,
	onVideoSample,
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
		true
	>;

	let iterator: BufferIterator | null = null;
	let parseResult: ParseResult | null = null;

	const state = makeParserState();

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

		if (parseResult) {
			parseResult = parseResult.continueParsing();
		} else {
			parseResult = parseVideo({
				iterator,
				options: {
					canSkipVideoData: !(
						onAudioSample ||
						onVideoSample ||
						onAudioTrack ||
						onVideoTrack
					),
					onAudioSample: onAudioSample ?? null,
					onVideoSample: onVideoSample ?? null,
					onAudioTrack: onAudioTrack ?? null,
					onVideoTrack: onVideoTrack ?? null,
					parserState: state,
					// TODO: Skip frames if onSimpleBlock is null
				},
			});
		}

		const matroskaSegment = getMainSegment(parseResult.segments);
		if (matroskaSegment) {
			const tracks = getTracksFromMatroska(matroskaSegment);
			for (const track of tracks.videoTracks) {
				if (state.isEmitted(track.trackId)) {
					continue;
				}

				state.addEmittedCodecId(track.trackId);
				if (onVideoTrack) {
					onVideoTrack(track);
				}
			}

			for (const track of tracks.audioTracks) {
				if (state.isEmitted(track.trackId)) {
					continue;
				}

				state.addEmittedCodecId(track.trackId);
				if (onAudioTrack) {
					onAudioTrack(track);
				}
			}
		}

		if (hasAllInfo(fields, parseResult)) {
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

	if (fields.dimensions) {
		const dimensions = getDimensions(parseResult.segments);
		returnValue.dimensions = {
			width: dimensions.width,
			height: dimensions.height,
		};
	}

	if (fields.unrotatedDimension) {
		const dimensions = getDimensions(parseResult.segments);
		returnValue.unrotatedDimension = {
			width: dimensions.unrotatedWidth,
			height: dimensions.unrotatedHeight,
		};
	}

	if (fields.rotation) {
		const dimensions = getDimensions(parseResult.segments);
		returnValue.rotation = dimensions.rotation;
	}

	if (fields.durationInSeconds) {
		returnValue.durationInSeconds = getDuration(parseResult.segments);
	}

	if (fields.fps) {
		returnValue.fps = getFps(parseResult.segments);
	}

	if (fields.videoCodec) {
		returnValue.videoCodec = getVideoCodec(parseResult.segments);
	}

	if (fields.audioCodec) {
		returnValue.audioCodec = getAudioCodec(parseResult.segments);
	}

	if (fields.tracks) {
		const {audioTracks, videoTracks} = getTracks(parseResult.segments);
		returnValue.audioTracks = audioTracks;
		returnValue.videoTracks = videoTracks;
	}

	if (fields.boxes) {
		returnValue.boxes = parseResult.segments;
	}

	return returnValue;
};
