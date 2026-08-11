import {
	defaultSelectM3uAssociatedPlaylists,
	defaultSelectM3uStreamFn,
} from './containers/m3u/select-stream';
import {mediaParserController} from './controller/media-parser-controller';
import {internalParseMedia} from './internal-parse-media';
import type {MediaParserReaderInterface} from './readers/reader';
import type {SeekingHints} from './seeking-hints';
import {withResolvers} from './with-resolvers';
import {forwardMediaParserControllerToWorker} from './worker/forward-controller-to-worker';
import {serializeError} from './worker/serialize-error';
import type {
	AcknowledgePayload,
	ParseMediaOnWorkerPayload,
	ResponseCallbackPayload,
	WorkerRequestPayload,
	WorkerResponsePayload,
} from './worker/worker-types';

const post = (message: WorkerResponsePayload) => {
	postMessage(message);
};

const controller = mediaParserController();

const executeCallback = (payload: ResponseCallbackPayload) => {
	// safari doesn't support crypto.randomUUID()
	const nonce = String(Math.random());
	const {promise, resolve, reject} = withResolvers<AcknowledgePayload>();

	const cb = (msg: MessageEvent) => {
		const data = msg.data as WorkerRequestPayload;
		if (data.type === 'acknowledge-callback' && data.nonce === nonce) {
			const {nonce: _, ...pay} = data;
			controller._internals
				.checkForAbortAndPause()
				.then(() => {
					resolve(pay);
				})
				.catch((err) => {
					reject(err);
				});
			removeEventListener('message', cb);
		}

		if (data.type === 'signal-error-in-callback') {
			reject(new Error('Error in callback function'));
		}
	};

	addEventListener('message', cb);

	post({
		type: 'response-on-callback-request',
		payload,
		nonce,
	});

	return promise;
};

const startParsing = async (
	message: ParseMediaOnWorkerPayload,
	reader: MediaParserReaderInterface,
) => {
	const {payload, src} = message;
	const {
		fields,
		acknowledgeRemotionLicense,
		logLevel: userLogLevel,
		progressIntervalInMs,
		m3uPlaylistContext,
		seekingHints,
		makeSamplesStartAtZero,
	} = payload;

	const {
		postAudioCodec,
		postContainer,
		postDimensions,
		postFps,
		postImages,
		postInternalStats,
		postIsHdr,
		postKeyframes,
		postLocation,
		postM3uStreams,
		postMetadata,
		postMimeType,
		postName,
		postNumberOfAudioChannels,
		postRotation,
		postSampleRate,
		postSlowAudioBitrate,
		postSlowNumberOfFrames,
		postSlowFps,
		postSlowDurationInSeconds,
		postSlowVideoBitrate,
		postSlowStructure,
		postTracks,
		postUnrotatedDimensions,
		postVideoCodec,
		postSize,
		postSlowKeyframes,
		postDurationInSeconds,
		postParseProgress,
		postM3uStreamSelection,
		postM3uAssociatedPlaylistsSelection,
		postOnAudioTrack,
		postOnVideoTrack,
	} = message;

	const logLevel = userLogLevel ?? 'info';

	try {
		const ret = await internalParseMedia({
			src,
			reader,
			acknowledgeRemotionLicense: Boolean(acknowledgeRemotionLicense),
			onError: () => ({action: 'fail'}),
			logLevel,
			fields: fields ?? null,
			apiName: 'parseMediaInWorker()',
			controller,
			mode: 'query',

			onAudioCodec: postAudioCodec
				? async (codec) => {
						await executeCallback({
							callbackType: 'audio-codec',
							value: codec,
						});
					}
				: null,
			onContainer: postContainer
				? async (container) => {
						await executeCallback({
							callbackType: 'container',
							value: container,
						});
					}
				: null,
			onDimensions: postDimensions
				? async (dimensions) => {
						await executeCallback({
							callbackType: 'dimensions',
							value: dimensions,
						});
					}
				: null,
			onFps: postFps
				? async (fps) => {
						await executeCallback({
							callbackType: 'fps',
							value: fps,
						});
					}
				: null,
			onImages: postImages
				? async (images) => {
						await executeCallback({
							callbackType: 'images',
							value: images,
						});
					}
				: null,
			onInternalStats: postInternalStats
				? async (internalStats) => {
						await executeCallback({
							callbackType: 'internal-stats',
							value: internalStats,
						});
					}
				: null,
			onIsHdr: postIsHdr
				? async (isHdr) => {
						await executeCallback({
							callbackType: 'is-hdr',
							value: isHdr,
						});
					}
				: null,
			onKeyframes: postKeyframes
				? async (keyframes) => {
						await executeCallback({
							callbackType: 'keyframes',
							value: keyframes,
						});
					}
				: null,
			onLocation: postLocation
				? async (location) => {
						await executeCallback({
							callbackType: 'location',
							value: location,
						});
					}
				: null,
			onM3uStreams: postM3uStreams
				? async (streams) => {
						await executeCallback({
							callbackType: 'm3u-streams',
							value: streams,
						});
					}
				: null,
			onMetadata: postMetadata
				? async (metadata) => {
						await executeCallback({
							callbackType: 'metadata',
							value: metadata,
						});
					}
				: null,
			onMimeType: postMimeType
				? async (mimeType) => {
						await executeCallback({
							callbackType: 'mime-type',
							value: mimeType,
						});
					}
				: null,
			onName: postName
				? async (name) => {
						await executeCallback({
							callbackType: 'name',
							value: name,
						});
					}
				: null,
			onNumberOfAudioChannels: postNumberOfAudioChannels
				? async (numberOfChannels) => {
						await executeCallback({
							callbackType: 'number-of-audio-channels',
							value: numberOfChannels,
						});
					}
				: null,
			onRotation: postRotation
				? async (rotation) => {
						await executeCallback({
							callbackType: 'rotation',
							value: rotation,
						});
					}
				: null,
			onSampleRate: postSampleRate
				? async (sampleRate) => {
						await executeCallback({
							callbackType: 'sample-rate',
							value: sampleRate,
						});
					}
				: null,
			onSize: postSize
				? async (size) => {
						await executeCallback({
							callbackType: 'size',
							value: size,
						});
					}
				: null,
			onSlowAudioBitrate: postSlowAudioBitrate
				? async (audioBitrate) => {
						await executeCallback({
							callbackType: 'slow-audio-bitrate',
							value: audioBitrate,
						});
					}
				: null,
			onSlowDurationInSeconds: postSlowDurationInSeconds
				? async (durationInSeconds) => {
						await executeCallback({
							callbackType: 'slow-duration-in-seconds',
							value: durationInSeconds,
						});
					}
				: null,
			onSlowFps: postSlowFps
				? async (fps) => {
						await executeCallback({
							callbackType: 'slow-fps',
							value: fps,
						});
					}
				: null,
			onSlowKeyframes: postSlowKeyframes
				? async (keyframes) => {
						await executeCallback({
							callbackType: 'slow-keyframes',
							value: keyframes,
						});
					}
				: null,
			onSlowNumberOfFrames: postSlowNumberOfFrames
				? async (numberOfFrames) => {
						await executeCallback({
							callbackType: 'slow-number-of-frames',
							value: numberOfFrames,
						});
					}
				: null,
			onSlowVideoBitrate: postSlowVideoBitrate
				? async (videoBitrate) => {
						await executeCallback({
							callbackType: 'slow-video-bitrate',
							value: videoBitrate,
						});
					}
				: null,
			onSlowStructure: postSlowStructure
				? async (structure) => {
						await executeCallback({
							callbackType: 'slow-structure',
							value: structure,
						});
					}
				: null,
			onTracks: postTracks
				? async (tracks) => {
						await executeCallback({
							callbackType: 'tracks',
							value: tracks,
						});
					}
				: null,

			onUnrotatedDimensions: postUnrotatedDimensions
				? async (dimensions) => {
						await executeCallback({
							callbackType: 'unrotated-dimensions',
							value: dimensions,
						});
					}
				: null,
			onVideoCodec: postVideoCodec
				? async (codec) => {
						await executeCallback({
							callbackType: 'video-codec',
							value: codec,
						});
					}
				: null,
			onDurationInSeconds: postDurationInSeconds
				? async (durationInSeconds) => {
						await executeCallback({
							callbackType: 'duration-in-seconds',
							value: durationInSeconds,
						});
					}
				: null,
			onParseProgress: postParseProgress
				? async (progress) => {
						await executeCallback({
							callbackType: 'parse-progress',
							value: progress,
						});
					}
				: null,
			progressIntervalInMs: progressIntervalInMs ?? null,
			selectM3uStream: postM3uStreamSelection
				? async (streamIndex) => {
						const res = await executeCallback({
							callbackType: 'm3u-stream-selection',
							value: streamIndex,
						});
						if (res.payloadType !== 'm3u-stream-selection') {
							throw new Error('Invalid response from callback');
						}

						return res.value;
					}
				: defaultSelectM3uStreamFn,
			m3uPlaylistContext: m3uPlaylistContext ?? null,
			selectM3uAssociatedPlaylists: postM3uAssociatedPlaylistsSelection
				? async (playlists) => {
						const res = await executeCallback({
							callbackType: 'm3u-associated-playlists-selection',
							value: playlists,
						});
						if (res.payloadType !== 'm3u-associated-playlists-selection') {
							throw new Error('Invalid response from callback');
						}

						return res.value;
					}
				: defaultSelectM3uAssociatedPlaylists,
			onAudioTrack: postOnAudioTrack
				? async (params) => {
						const res = await executeCallback({
							callbackType: 'on-audio-track',
							value: params,
						});

						if (res.payloadType !== 'on-audio-track-response') {
							throw new Error('Invalid response from callback');
						}

						if (!res.registeredCallback) {
							return null;
						}

						return async (sample) => {
							const audioSampleRes = await executeCallback({
								callbackType: 'on-audio-sample',
								value: sample,
								trackId: params.track.trackId,
							});

							if (audioSampleRes.payloadType !== 'on-sample-response') {
								throw new Error('Invalid response from callback');
							}

							if (!audioSampleRes.registeredTrackDoneCallback) {
								return;
							}

							return async () => {
								await executeCallback({
									callbackType: 'track-done',
									trackId: params.track.trackId,
								});
							};
						};
					}
				: null,
			onVideoTrack: postOnVideoTrack
				? async (params) => {
						const res = await executeCallback({
							callbackType: 'on-video-track',
							value: params,
						});

						if (res.payloadType !== 'on-video-track-response') {
							throw new Error('Invalid response from callback');
						}

						if (!res.registeredCallback) {
							return null;
						}

						return async (sample) => {
							const videoSampleRes = await executeCallback({
								callbackType: 'on-video-sample',
								value: sample,
								trackId: params.track.trackId,
							});

							if (videoSampleRes.payloadType !== 'on-sample-response') {
								throw new Error('Invalid response from callback');
							}

							if (!videoSampleRes.registeredTrackDoneCallback) {
								return;
							}

							return async () => {
								await executeCallback({
									callbackType: 'track-done',
									trackId: params.track.trackId,
								});
							};
						};
					}
				: null,
			onDiscardedData: null,
			makeSamplesStartAtZero: makeSamplesStartAtZero ?? true,
			seekingHints: seekingHints ?? null,
		});
		post({
			type: 'response-done',
			payload: ret,
			seekingHints: await controller.getSeekingHints(),
		});
	} catch (e) {
		let seekingHintsRes: SeekingHints | null = null;
		try {
			seekingHintsRes = await controller.getSeekingHints();
		} catch {}

		post(
			serializeError({
				error: e as Error,
				logLevel,
				seekingHints: seekingHintsRes,
			}),
		);
	}
};

const onMessageForWorker = forwardMediaParserControllerToWorker(controller);

export const messageHandler = (
	message: MessageEvent,
	readerInterface: MediaParserReaderInterface,
) => {
	const data = message.data as WorkerRequestPayload;

	if (data.type === 'request-worker') {
		startParsing(data, readerInterface);
		return;
	}

	// not handled here
	if (data.type === 'acknowledge-callback') {
		return;
	}

	if (data.type === 'signal-error-in-callback') {
		return;
	}

	onMessageForWorker(data);
};
