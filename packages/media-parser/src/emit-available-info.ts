import {getAudioCodec} from './get-audio-codec';
import {getContainer} from './get-container';
import type {Dimensions} from './get-dimensions';
import {getDimensions} from './get-dimensions';
import {getDuration} from './get-duration';
import {getFps} from './get-fps';
import {getIsHdr} from './get-is-hdr';
import {getLocation} from './get-location';
import {getTracks} from './get-tracks';
import {getVideoCodec} from './get-video-codec';
import {getMetadata} from './metadata/get-metadata';
import type {
	AllOptions,
	AllParseMediaFields,
	Options,
	ParseMediaCallbacks,
	ParseMediaFields,
	ParseMediaResult,
} from './options';
import type {ParseResult, Structure} from './parse-result';
import type {ParserState} from './state/parser-state';

export const emitAvailableInfo = ({
	hasInfo,
	parseResult,
	callbacks,
	state,
	returnValue,
	contentLength,
	name,
	mimeType,
	fieldsInReturnValue,
	emittedFields,
}: {
	hasInfo: Record<keyof Options<ParseMediaFields>, boolean>;
	parseResult: ParseResult<Structure> | null;
	callbacks: ParseMediaCallbacks;
	fieldsInReturnValue: Options<ParseMediaFields>;
	emittedFields: AllOptions<ParseMediaFields>;
	state: ParserState;
	returnValue: ParseMediaResult<AllParseMediaFields>;
	contentLength: number | null;
	mimeType: string | null;
	name: string;
}) => {
	const keys = Object.keys(hasInfo) as (keyof Options<ParseMediaFields>)[];

	for (const key of keys) {
		if (key === 'structure') {
			if (parseResult && hasInfo.structure && !emittedFields.structure) {
				callbacks.onStructure?.(parseResult.segments);
				if (fieldsInReturnValue.structure) {
					returnValue.structure = parseResult.segments;
				}

				emittedFields.structure = true;
			}

			continue;
		}

		if (key === 'durationInSeconds') {
			if (
				hasInfo.durationInSeconds &&
				!emittedFields.durationInSeconds &&
				parseResult
			) {
				const durationInSeconds = getDuration(parseResult.segments, state);
				callbacks.onDurationInSeconds?.(durationInSeconds);
				if (fieldsInReturnValue.durationInSeconds) {
					returnValue.durationInSeconds = durationInSeconds;
				}

				emittedFields.durationInSeconds = true;
			}

			continue;
		}

		if (key === 'dimensions') {
			if (hasInfo.dimensions && !emittedFields.dimensions && parseResult) {
				const dimensionsQueried = getDimensions(parseResult.segments, state);
				const dimensions: Dimensions = {
					height: dimensionsQueried.height,
					width: dimensionsQueried.width,
				};
				callbacks.onDimensions?.(dimensions);
				if (fieldsInReturnValue.dimensions) {
					returnValue.dimensions = dimensions;
				}

				emittedFields.dimensions = true;
			}

			continue;
		}

		if (key === 'unrotatedDimensions') {
			if (
				hasInfo.unrotatedDimensions &&
				!emittedFields.unrotatedDimensions &&
				parseResult
			) {
				const dimensionsQueried = getDimensions(parseResult.segments, state);
				const unrotatedDimensions: Dimensions = {
					height: dimensionsQueried.unrotatedHeight,
					width: dimensionsQueried.unrotatedWidth,
				};

				callbacks.onUnrotatedDimensions?.(unrotatedDimensions);
				if (fieldsInReturnValue.unrotatedDimensions) {
					returnValue.unrotatedDimensions = unrotatedDimensions;
				}

				emittedFields.unrotatedDimensions = true;
			}

			continue;
		}

		if (key === 'rotation') {
			if (hasInfo.rotation && !emittedFields.rotation && parseResult) {
				const dimensionsQueried = getDimensions(parseResult.segments, state);
				const {rotation} = dimensionsQueried;

				callbacks.onRotation?.(rotation);
				if (fieldsInReturnValue.rotation) {
					returnValue.rotation = rotation;
				}

				emittedFields.rotation = true;
			}

			continue;
		}

		if (key === 'fps') {
			if (!emittedFields.fps && hasInfo.fps && parseResult) {
				const fps = getFps(parseResult.segments);
				callbacks.onFps?.(fps);
				if (fieldsInReturnValue.fps) {
					returnValue.fps = fps;
				}

				emittedFields.fps = true;
			}

			continue;
		}

		if (key === 'videoCodec') {
			if (!emittedFields.videoCodec && hasInfo.videoCodec && parseResult) {
				const videoCodec = getVideoCodec(parseResult.segments, state);
				callbacks.onVideoCodec?.(videoCodec);
				if (fieldsInReturnValue.videoCodec) {
					returnValue.videoCodec = videoCodec;
				}

				emittedFields.videoCodec = true;
			}

			continue;
		}

		if (key === 'audioCodec') {
			if (!emittedFields.audioCodec && hasInfo.audioCodec && parseResult) {
				const audioCodec = getAudioCodec(parseResult.segments, state);
				callbacks.onAudioCodec?.(audioCodec);
				if (fieldsInReturnValue.audioCodec) {
					returnValue.audioCodec = audioCodec;
				}

				emittedFields.audioCodec = true;
			}

			continue;
		}

		if (key === 'tracks') {
			if (!emittedFields.tracks && hasInfo.tracks && parseResult) {
				const {videoTracks, audioTracks} = getTracks(
					parseResult.segments,
					state,
				);
				callbacks.onTracks?.({videoTracks, audioTracks});
				if (fieldsInReturnValue.tracks) {
					returnValue.tracks = {videoTracks, audioTracks};
				}

				emittedFields.tracks = true;
			}

			continue;
		}

		if (key === 'internalStats') {
			// Special case: Always emitting internal stats at the end
			if (hasInfo.internalStats) {
				const internalStats = state.getInternalStats();
				if (fieldsInReturnValue.internalStats) {
					returnValue.internalStats = internalStats;
				}

				emittedFields.internalStats = true;
			}

			continue;
		}

		if (key === 'size') {
			if (!emittedFields.size && hasInfo.size) {
				callbacks.onSize?.(contentLength);
				if (fieldsInReturnValue.size) {
					returnValue.size = contentLength;
				}

				emittedFields.size = true;
			}

			continue;
		}

		if (key === 'mimeType') {
			if (!emittedFields.mimeType && hasInfo.mimeType) {
				callbacks.onMimeType?.(mimeType);
				if (fieldsInReturnValue.mimeType) {
					returnValue.mimeType = mimeType;
				}

				emittedFields.mimeType = true;
			}

			continue;
		}

		if (key === 'name') {
			if (!emittedFields.name && hasInfo.name) {
				callbacks.onName?.(name);
				if (fieldsInReturnValue.name) {
					returnValue.name = name;
				}

				emittedFields.name = true;
			}

			continue;
		}

		if (key === 'isHdr') {
			if (!returnValue.isHdr && hasInfo.isHdr && parseResult) {
				const isHdr = getIsHdr(parseResult.segments, state);
				callbacks.onIsHdr?.(isHdr);
				if (fieldsInReturnValue.isHdr) {
					returnValue.isHdr = isHdr;
				}

				emittedFields.isHdr = true;
			}

			continue;
		}

		if (key === 'container') {
			if (!returnValue.container && hasInfo.container && parseResult) {
				const container = getContainer(parseResult.segments);
				callbacks.onContainer?.(container);
				if (fieldsInReturnValue.container) {
					returnValue.container = container;
				}

				emittedFields.container = true;
			}

			continue;
		}

		if (key === 'metadata') {
			if (!emittedFields.metadata && hasInfo.metadata && parseResult) {
				const metadata = getMetadata(parseResult.segments);
				callbacks.onMetadata?.(metadata);
				if (fieldsInReturnValue.metadata) {
					returnValue.metadata = metadata;
				}

				emittedFields.metadata = true;
			}

			continue;
		}

		if (key === 'location') {
			if (!emittedFields.location && hasInfo.location && parseResult) {
				const location = getLocation(parseResult.segments);
				callbacks.onLocation?.(location);
				if (fieldsInReturnValue.location) {
					returnValue.location = location;
				}

				emittedFields.location = true;
			}

			continue;
		}

		if (key === 'keyframes') {
			if (!emittedFields.keyframes && hasInfo.keyframes && parseResult) {
				callbacks.onKeyframes?.(
					state.keyframes.getKeyframes(parseResult.segments),
				);
				if (fieldsInReturnValue.keyframes) {
					returnValue.keyframes = state.keyframes.getKeyframes(
						parseResult.segments,
					);
				}

				emittedFields.keyframes = true;
			}

			continue;
		}

		throw new Error(`Unhandled key: ${key satisfies never}`);
	}
};
