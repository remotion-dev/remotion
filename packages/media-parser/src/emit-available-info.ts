import {getAudioCodec} from './get-audio-codec';
import type {Dimensions} from './get-dimensions';
import {getDimensions} from './get-dimensions';
import {getDuration} from './get-duration';
import {getFps} from './get-fps';
import {getTracks} from './get-tracks';
import {getVideoCodec} from './get-video-codec';
import type {
	AllParseMediaFields,
	Options,
	ParseMediaCallbacks,
	ParseMediaFields,
	ParseMediaResult,
} from './options';
import type {ParseResult} from './parse-result';
import type {ParserState} from './parser-state';

export const emitAvailableInfo = ({
	hasInfo,
	parseResult,
	moreFields,
	state,
	returnValue,
	contentLength,
	name,
}: {
	hasInfo: Record<keyof Options<ParseMediaFields>, boolean>;
	parseResult: ParseResult;
	moreFields: ParseMediaCallbacks<AllParseMediaFields>;
	state: ParserState;
	returnValue: ParseMediaResult<AllParseMediaFields>;
	contentLength: number | null;
	name: string;
}) => {
	const keys = Object.keys(hasInfo) as (keyof Options<ParseMediaFields>)[];

	for (const key of keys) {
		if (key === 'boxes') {
			if (hasInfo.boxes && returnValue.boxes === undefined) {
				moreFields.onBoxes?.(parseResult.segments);
				returnValue.boxes = parseResult.segments;
			}

			continue;
		}

		if (key === 'durationInSeconds') {
			if (
				hasInfo.durationInSeconds &&
				returnValue.durationInSeconds === undefined
			) {
				const durationInSeconds = getDuration(parseResult.segments, state);
				moreFields.onDurationInSeconds?.(durationInSeconds);
				returnValue.durationInSeconds = durationInSeconds;
			}

			continue;
		}

		if (key === 'dimensions') {
			if (hasInfo.dimensions && returnValue.dimensions === undefined) {
				const dimensionsQueried = getDimensions(parseResult.segments, state);
				const dimensions: Dimensions = {
					height: dimensionsQueried.height,
					width: dimensionsQueried.width,
				};
				moreFields.onDimensions?.(dimensions);
				returnValue.dimensions = dimensions;
			}

			continue;
		}

		if (key === 'unrotatedDimensions') {
			if (
				returnValue.unrotatedDimensions === undefined &&
				hasInfo.unrotatedDimensions
			) {
				const dimensionsQueried = getDimensions(parseResult.segments, state);
				const unrotatedDimensions: Dimensions = {
					height: dimensionsQueried.unrotatedHeight,
					width: dimensionsQueried.unrotatedWidth,
				};

				moreFields.onUnrotatedDimensions?.(unrotatedDimensions);
				returnValue.unrotatedDimensions = unrotatedDimensions;
			}

			continue;
		}

		if (key === 'rotation') {
			if (returnValue.rotation === undefined && hasInfo.rotation) {
				const dimensionsQueried = getDimensions(parseResult.segments, state);
				const {rotation} = dimensionsQueried;

				moreFields.onRotation?.(rotation);
				returnValue.rotation = rotation;
			}

			continue;
		}

		if (key === 'fps') {
			if (returnValue.fps === undefined && hasInfo.fps) {
				const fps = getFps(parseResult.segments);
				moreFields.onFps?.(fps);
				returnValue.fps = fps;
			}

			continue;
		}

		if (key === 'videoCodec') {
			if (returnValue.videoCodec === undefined && hasInfo.videoCodec) {
				const videoCodec = getVideoCodec(parseResult.segments);
				moreFields.onVideoCodec?.(videoCodec);
				returnValue.videoCodec = videoCodec;
			}

			continue;
		}

		if (key === 'audioCodec') {
			if (returnValue.audioCodec === undefined && hasInfo.audioCodec) {
				const audioCodec = getAudioCodec(parseResult.segments, state);
				moreFields.onAudioCodec?.(audioCodec);
				returnValue.audioCodec = audioCodec;
			}

			continue;
		}

		if (key === 'tracks') {
			if (
				hasInfo.tracks &&
				returnValue.videoTracks === undefined &&
				returnValue.audioTracks === undefined
			) {
				const {videoTracks, audioTracks} = getTracks(
					parseResult.segments,
					state,
				);
				moreFields.onTracks?.({videoTracks, audioTracks});
				returnValue.videoTracks = videoTracks;
				returnValue.audioTracks = audioTracks;
			}

			continue;
		}

		if (key === 'internalStats') {
			if (hasInfo.internalStats && returnValue.internalStats === undefined) {
				const internalStats = state.getInternalStats();
				moreFields.onInternalStats?.(internalStats);
				returnValue.internalStats = internalStats;
			}

			continue;
		}

		if (key === 'size') {
			if (returnValue.size === undefined && hasInfo.size) {
				moreFields.onSize?.(contentLength);
				returnValue.size = contentLength;
			}

			continue;
		}

		if (key === 'name') {
			if (returnValue.name === undefined && hasInfo.name) {
				moreFields.onName?.(name);
				returnValue.name = name;
			}

			continue;
		}

		throw new Error(`Unhandled key: ${key satisfies never}`);
	}
};
