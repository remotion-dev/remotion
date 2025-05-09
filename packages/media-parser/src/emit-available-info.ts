import {getM3uStreams} from './containers/m3u/get-streams';
import type {Options, ParseMediaFields} from './fields';
import {getAudioCodec} from './get-audio-codec';
import {getContainer} from './get-container';
import type {MediaParserDimensions} from './get-dimensions';
import {getDimensions} from './get-dimensions';
import {getDuration} from './get-duration';
import {getFps} from './get-fps';
import {getIsHdr} from './get-is-hdr';
import {getKeyframes} from './get-keyframes';
import {getLocation} from './get-location';
import {getNumberOfAudioChannels} from './get-number-of-audio-channels';
import {getSampleRate} from './get-sample-rate';
import {getTracks} from './get-tracks';
import {getVideoCodec} from './get-video-codec';
import {getMetadata} from './metadata/get-metadata';
import type {ParserState} from './state/parser-state';
import {
	getWorkOnSeekRequestOptions,
	workOnSeekRequest,
} from './work-on-seek-request';

export const emitAvailableInfo = async ({
	hasInfo,
	state,
}: {
	hasInfo: Record<keyof Options<ParseMediaFields>, boolean>;
	state: ParserState;
}) => {
	const keys = Object.keys(hasInfo) as (keyof Options<ParseMediaFields>)[];

	const {
		emittedFields,
		fieldsInReturnValue,
		returnValue,
		name,
		callbackFunctions,
	} = state;

	for (const key of keys) {
		await workOnSeekRequest(getWorkOnSeekRequestOptions(state));
		if (key === 'slowStructure') {
			if (hasInfo.slowStructure && !emittedFields.slowStructure) {
				await callbackFunctions.onSlowStructure?.(
					state.structure.getStructure(),
				);
				if (fieldsInReturnValue.slowStructure) {
					returnValue.slowStructure = state.structure.getStructure();
				}

				emittedFields.slowStructure = true;
			}

			continue;
		}

		if (key === 'durationInSeconds') {
			if (hasInfo.durationInSeconds) {
				if (!emittedFields.durationInSeconds) {
					const durationInSeconds = getDuration(state);
					await callbackFunctions.onDurationInSeconds?.(durationInSeconds);
					if (fieldsInReturnValue.durationInSeconds) {
						returnValue.durationInSeconds = durationInSeconds;
					}

					emittedFields.durationInSeconds = true;
				}
			}

			continue;
		}

		if (key === 'slowDurationInSeconds') {
			if (
				hasInfo.slowDurationInSeconds &&
				!emittedFields.slowDurationInSeconds
			) {
				const slowDurationInSeconds =
					getDuration(state) ??
					state.samplesObserved.getSlowDurationInSeconds();
				await callbackFunctions.onSlowDurationInSeconds?.(
					slowDurationInSeconds,
				);
				if (fieldsInReturnValue.slowDurationInSeconds) {
					returnValue.slowDurationInSeconds = slowDurationInSeconds;
				}

				emittedFields.slowDurationInSeconds = true;
			}

			continue;
		}

		if (key === 'fps') {
			if (hasInfo.fps) {
				if (!emittedFields.fps) {
					const fps = getFps(state);
					await callbackFunctions.onFps?.(fps);
					if (fieldsInReturnValue.fps) {
						returnValue.fps = fps;
					}

					emittedFields.fps = true;
				}

				if (!emittedFields.slowFps) {
					const fps = getFps(state);
					if (fps) {
						await callbackFunctions.onSlowFps?.(fps);
						if (fieldsInReturnValue.slowFps) {
							returnValue.slowFps = fps;
						}

						emittedFields.slowFps = true;
					}
				}
			}

			continue;
		}

		// must be handled after fps
		if (key === 'slowFps') {
			if (hasInfo.slowFps && !emittedFields.slowFps) {
				const slowFps = getFps(state) ?? state.samplesObserved.getFps();
				await callbackFunctions.onSlowFps?.(slowFps);
				if (fieldsInReturnValue.slowFps) {
					returnValue.slowFps = slowFps;
				}

				emittedFields.slowFps = true;
			}

			continue;
		}

		if (key === 'dimensions') {
			if (hasInfo.dimensions && !emittedFields.dimensions) {
				const dimensionsQueried = getDimensions(state);
				const dimensions: MediaParserDimensions | null =
					dimensionsQueried === null
						? null
						: {
								height: dimensionsQueried.height,
								width: dimensionsQueried.width,
							};
				await callbackFunctions.onDimensions?.(dimensions);
				if (fieldsInReturnValue.dimensions) {
					returnValue.dimensions = dimensions;
				}

				emittedFields.dimensions = true;
			}

			continue;
		}

		if (key === 'unrotatedDimensions') {
			if (hasInfo.unrotatedDimensions && !emittedFields.unrotatedDimensions) {
				const dimensionsQueried = getDimensions(state);
				const unrotatedDimensions: MediaParserDimensions | null =
					dimensionsQueried === null
						? null
						: {
								height: dimensionsQueried.unrotatedHeight,
								width: dimensionsQueried.unrotatedWidth,
							};

				await callbackFunctions.onUnrotatedDimensions?.(unrotatedDimensions);
				if (fieldsInReturnValue.unrotatedDimensions) {
					returnValue.unrotatedDimensions = unrotatedDimensions;
				}

				emittedFields.unrotatedDimensions = true;
			}

			continue;
		}

		if (key === 'rotation') {
			if (hasInfo.rotation && !emittedFields.rotation) {
				const dimensionsQueried = getDimensions(state);
				const rotation = dimensionsQueried?.rotation ?? 0;

				await callbackFunctions.onRotation?.(rotation);
				if (fieldsInReturnValue.rotation) {
					returnValue.rotation = rotation;
				}

				emittedFields.rotation = true;
			}

			continue;
		}

		if (key === 'videoCodec') {
			if (!emittedFields.videoCodec && hasInfo.videoCodec) {
				const videoCodec = getVideoCodec(state);
				await callbackFunctions.onVideoCodec?.(videoCodec);
				if (fieldsInReturnValue.videoCodec) {
					returnValue.videoCodec = videoCodec;
				}

				emittedFields.videoCodec = true;
			}

			continue;
		}

		if (key === 'audioCodec') {
			if (!emittedFields.audioCodec && hasInfo.audioCodec) {
				const audioCodec = getAudioCodec(state);
				await callbackFunctions.onAudioCodec?.(audioCodec);
				if (fieldsInReturnValue.audioCodec) {
					returnValue.audioCodec = audioCodec;
				}

				emittedFields.audioCodec = true;
			}

			continue;
		}

		if (key === 'tracks') {
			if (!emittedFields.tracks && hasInfo.tracks) {
				const tracks = getTracks(state, true);
				await callbackFunctions.onTracks?.(tracks);
				if (fieldsInReturnValue.tracks) {
					returnValue.tracks = tracks;
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
				await callbackFunctions.onSize?.(state.contentLength);
				if (fieldsInReturnValue.size) {
					returnValue.size = state.contentLength;
				}

				emittedFields.size = true;
			}

			continue;
		}

		if (key === 'mimeType') {
			if (!emittedFields.mimeType && hasInfo.mimeType) {
				await callbackFunctions.onMimeType?.(state.mimeType);
				if (fieldsInReturnValue.mimeType) {
					returnValue.mimeType = state.mimeType;
				}

				emittedFields.mimeType = true;
			}

			continue;
		}

		if (key === 'name') {
			if (!emittedFields.name && hasInfo.name) {
				await callbackFunctions.onName?.(name);
				if (fieldsInReturnValue.name) {
					returnValue.name = name;
				}

				emittedFields.name = true;
			}

			continue;
		}

		if (key === 'isHdr') {
			if (!returnValue.isHdr && hasInfo.isHdr) {
				const isHdr = getIsHdr(state);
				await callbackFunctions.onIsHdr?.(isHdr);
				if (fieldsInReturnValue.isHdr) {
					returnValue.isHdr = isHdr;
				}

				emittedFields.isHdr = true;
			}

			continue;
		}

		if (key === 'container') {
			if (!returnValue.container && hasInfo.container) {
				const container = getContainer(state.structure.getStructure());
				await callbackFunctions.onContainer?.(container);
				if (fieldsInReturnValue.container) {
					returnValue.container = container;
				}

				emittedFields.container = true;
			}

			continue;
		}

		if (key === 'metadata') {
			if (!emittedFields.metadata && hasInfo.metadata) {
				const metadata = getMetadata(state);
				await callbackFunctions.onMetadata?.(metadata);
				if (fieldsInReturnValue.metadata) {
					returnValue.metadata = metadata;
				}

				emittedFields.metadata = true;
			}

			continue;
		}

		if (key === 'location') {
			if (!emittedFields.location && hasInfo.location) {
				const location = getLocation(state);
				await callbackFunctions.onLocation?.(location);
				if (fieldsInReturnValue.location) {
					returnValue.location = location;
				}

				emittedFields.location = true;
			}

			continue;
		}

		if (key === 'slowKeyframes') {
			if (!emittedFields.slowKeyframes && hasInfo.slowKeyframes) {
				await callbackFunctions.onSlowKeyframes?.(
					state.keyframes.getKeyframes(),
				);
				if (fieldsInReturnValue.slowKeyframes) {
					returnValue.slowKeyframes = state.keyframes.getKeyframes();
				}

				emittedFields.slowKeyframes = true;
			}

			continue;
		}

		if (key === 'slowNumberOfFrames') {
			if (!emittedFields.slowNumberOfFrames && hasInfo.slowNumberOfFrames) {
				await callbackFunctions.onSlowNumberOfFrames?.(
					state.samplesObserved.getSlowNumberOfFrames(),
				);
				if (fieldsInReturnValue.slowNumberOfFrames) {
					returnValue.slowNumberOfFrames =
						state.samplesObserved.getSlowNumberOfFrames();
				}

				emittedFields.slowNumberOfFrames = true;
			}

			continue;
		}

		if (key === 'slowAudioBitrate') {
			if (!emittedFields.slowAudioBitrate && hasInfo.slowAudioBitrate) {
				await callbackFunctions.onSlowAudioBitrate?.(
					state.samplesObserved.getAudioBitrate(),
				);
				if (fieldsInReturnValue.slowAudioBitrate) {
					returnValue.slowAudioBitrate =
						state.samplesObserved.getAudioBitrate();
				}

				emittedFields.slowAudioBitrate = true;
			}

			continue;
		}

		if (key === 'slowVideoBitrate') {
			if (!emittedFields.slowVideoBitrate && hasInfo.slowVideoBitrate) {
				await callbackFunctions.onSlowVideoBitrate?.(
					state.samplesObserved.getVideoBitrate(),
				);
				if (fieldsInReturnValue.slowVideoBitrate) {
					returnValue.slowVideoBitrate =
						state.samplesObserved.getVideoBitrate();
				}

				emittedFields.slowVideoBitrate = true;
			}

			continue;
		}

		if (key === 'keyframes') {
			if (!emittedFields.keyframes && hasInfo.keyframes) {
				await callbackFunctions.onKeyframes?.(getKeyframes(state));
				if (fieldsInReturnValue.keyframes) {
					returnValue.keyframes = getKeyframes(state);
				}

				emittedFields.keyframes = true;
			}

			continue;
		}

		if (key === 'images') {
			if (!emittedFields.images && hasInfo.images) {
				await callbackFunctions.onImages?.(state.images.images);
				if (fieldsInReturnValue.images) {
					returnValue.images = state.images.images;
				}

				emittedFields.images = true;
			}

			continue;
		}

		if (key === 'sampleRate') {
			if (!emittedFields.sampleRate && hasInfo.sampleRate) {
				const sampleRate = getSampleRate(state);
				await callbackFunctions.onSampleRate?.(sampleRate);
				if (fieldsInReturnValue.sampleRate) {
					returnValue.sampleRate = sampleRate;
				}

				emittedFields.sampleRate = true;
			}

			continue;
		}

		if (key === 'numberOfAudioChannels') {
			if (
				!emittedFields.numberOfAudioChannels &&
				hasInfo.numberOfAudioChannels
			) {
				const numberOfAudioChannels = getNumberOfAudioChannels(state);
				await callbackFunctions.onNumberOfAudioChannels?.(
					numberOfAudioChannels,
				);
				if (fieldsInReturnValue.numberOfAudioChannels) {
					returnValue.numberOfAudioChannels = numberOfAudioChannels;
				}

				emittedFields.numberOfAudioChannels = true;
			}

			continue;
		}

		if (key === 'm3uStreams') {
			if (!emittedFields.m3uStreams && hasInfo.m3uStreams) {
				const streams = getM3uStreams({
					structure: state.structure.getStructureOrNull(),
					originalSrc: state.src,
					readerInterface: state.readerInterface,
				});
				await callbackFunctions.onM3uStreams?.(streams);
				if (fieldsInReturnValue.m3uStreams) {
					returnValue.m3uStreams = streams;
				}

				emittedFields.m3uStreams = true;
			}

			continue;
		}

		throw new Error(`Unhandled key: ${key satisfies never}`);
	}

	await workOnSeekRequest(getWorkOnSeekRequestOptions(state));
};
