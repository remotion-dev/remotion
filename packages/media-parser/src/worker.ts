import type {
	AllOptions,
	Options,
	ParseMedia,
	ParseMediaFields,
	ParseMediaOptions,
	ParseMediaResult,
} from './options';
import {deserializeError} from './worker/serialize-error';
import type {
	ParseMediaOnWorker,
	WorkerRequestPayload,
	WorkerResponsePayload,
} from './worker/worker-types';

const convertToWorkerPayload = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	payload: Omit<ParseMediaOptions<any>, 'controller'>,
): ParseMediaOnWorker => {
	const {
		onAudioCodec,
		onContainer,
		onDimensions,
		onUnrotatedDimensions,
		onVideoCodec,
		onFps,
		onAudioTrack,
		onDurationInSeconds,
		onImages,
		onInternalStats,
		onIsHdr,
		onKeyframes,
		onLocation,
		onM3uStreams,
		onMetadata,
		onMimeType,
		onName,
		onNumberOfAudioChannels,
		// TODO: Callback functions
		onParseProgress,
		onRotation,
		onSampleRate,
		onSlowAudioBitrate,
		onSize,
		onSlowDurationInSeconds,
		onSlowFps,
		onSlowKeyframes,
		onSlowNumberOfFrames,
		onSlowVideoBitrate,
		onStructure,
		onTracks,
		onVideoTrack,
		...others
	} = payload;

	return {
		type: 'request-worker',
		payload: others,
		postAudioCodec: Boolean(onAudioCodec),
		postContainer: Boolean(onContainer),
		postDimensions: Boolean(onDimensions),
		postDurationInSeconds: Boolean(onDurationInSeconds),
		postFps: Boolean(onFps),
		postImages: Boolean(onImages),
		postInternalStats: Boolean(onInternalStats),
		postIsHdr: Boolean(onIsHdr),
		postKeyframes: Boolean(onKeyframes),
		postLocation: Boolean(onLocation),
		postM3uStreams: Boolean(onM3uStreams),
		postMetadata: Boolean(onMetadata),
		postMimeType: Boolean(onMimeType),
		postName: Boolean(onName),
		postNumberOfAudioChannels: Boolean(onNumberOfAudioChannels),
		postRotation: Boolean(onRotation),
		postSampleRate: Boolean(onSampleRate),
		postSlowAudioBitrate: Boolean(onSlowAudioBitrate),
		postSlowDurationInSeconds: Boolean(onSlowDurationInSeconds),
		postSlowFps: Boolean(onSlowFps),
		postSlowKeyframes: Boolean(onSlowKeyframes),
		postSlowNumberOfFrames: Boolean(onSlowNumberOfFrames),
		postSlowVideoBitrate: Boolean(onSlowVideoBitrate),
		postStructure: Boolean(onStructure),
		postTracks: Boolean(onTracks),
		postUnrotatedDimensions: Boolean(onUnrotatedDimensions),
		postVideoCodec: Boolean(onVideoCodec),
		postSize: Boolean(onSize),
	};
};

const post = (worker: Worker, payload: WorkerRequestPayload) => {
	worker.postMessage(payload);
};

export const parseMediaOnWorker: ParseMedia = async <
	F extends Options<ParseMediaFields>,
>({
	controller,
	...params
}: ParseMediaOptions<F>) => {
	if (typeof Worker === 'undefined') {
		throw new Error('"Worker" is not available. Cannot call workerClient()');
	}

	const worker = new Worker(new URL('./worker-server', import.meta.url));

	post(worker, convertToWorkerPayload(params));

	const {promise, resolve, reject} =
		Promise.withResolvers<
			ParseMediaResult<Partial<AllOptions<ParseMediaFields>>>
		>();

	const onAbort = () => {
		post(worker, {type: 'request-abort'});
	};

	const onResume = () => {
		post(worker, {type: 'request-resume'});
	};

	const onPause = () => {
		post(worker, {type: 'request-pause'});
	};

	function onMessage(message: MessageEvent) {
		const data = message.data as WorkerResponsePayload;
		if (data.type === 'response-done') {
			resolve(data.payload);
		}

		if (data.type === 'response-error') {
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			cleanup();
			reject(deserializeError(data));
		}

		if (data.type === 'response-on-callback-request') {
			Promise.resolve()
				.then(() => {
					if (data.payload.callbackType === 'audio-codec') {
						return params.onAudioCodec?.(data.payload.value);
					}

					if (data.payload.callbackType === 'container') {
						return params.onContainer?.(data.payload.value);
					}

					if (data.payload.callbackType === 'dimensions') {
						return params.onDimensions?.(data.payload.value);
					}

					if (data.payload.callbackType === 'unrotated-dimensions') {
						return params.onUnrotatedDimensions?.(data.payload.value);
					}

					if (data.payload.callbackType === 'video-codec') {
						return params.onVideoCodec?.(data.payload.value);
					}

					if (data.payload.callbackType === 'tracks') {
						return params.onTracks?.(data.payload.value);
					}

					if (data.payload.callbackType === 'rotation') {
						return params.onRotation?.(data.payload.value);
					}

					if (data.payload.callbackType === 'sample-rate') {
						return params.onSampleRate?.(data.payload.value);
					}

					if (data.payload.callbackType === 'slow-audio-bitrate') {
						return params.onSlowAudioBitrate?.(data.payload.value);
					}

					if (data.payload.callbackType === 'slow-duration-in-seconds') {
						return params.onSlowDurationInSeconds?.(data.payload.value);
					}

					if (data.payload.callbackType === 'slow-fps') {
						return params.onSlowFps?.(data.payload.value);
					}

					if (data.payload.callbackType === 'slow-keyframes') {
						return params.onSlowKeyframes?.(data.payload.value);
					}

					if (data.payload.callbackType === 'slow-number-of-frames') {
						return params.onSlowNumberOfFrames?.(data.payload.value);
					}

					if (data.payload.callbackType === 'slow-video-bitrate') {
						return params.onSlowVideoBitrate?.(data.payload.value);
					}

					if (data.payload.callbackType === 'structure') {
						return params.onStructure?.(data.payload.value);
					}

					if (data.payload.callbackType === 'fps') {
						return params.onFps?.(data.payload.value);
					}

					if (data.payload.callbackType === 'images') {
						return params.onImages?.(data.payload.value);
					}

					if (data.payload.callbackType === 'internal-stats') {
						return params.onInternalStats?.(data.payload.value);
					}

					if (data.payload.callbackType === 'is-hdr') {
						return params.onIsHdr?.(data.payload.value);
					}

					if (data.payload.callbackType === 'keyframes') {
						return params.onKeyframes?.(data.payload.value);
					}

					if (data.payload.callbackType === 'location') {
						return params.onLocation?.(data.payload.value);
					}

					if (data.payload.callbackType === 'm3u-streams') {
						return params.onM3uStreams?.(data.payload.value);
					}

					if (data.payload.callbackType === 'metadata') {
						return params.onMetadata?.(data.payload.value);
					}

					if (data.payload.callbackType === 'mime-type') {
						return params.onMimeType?.(data.payload.value);
					}

					if (data.payload.callbackType === 'name') {
						return params.onName?.(data.payload.value);
					}

					if (data.payload.callbackType === 'number-of-audio-channels') {
						return params.onNumberOfAudioChannels?.(data.payload.value);
					}

					if (data.payload.callbackType === 'size') {
						return params.onSize?.(data.payload.value);
					}

					if (data.payload.callbackType === 'duration-in-seconds') {
						return params.onDurationInSeconds?.(data.payload.value);
					}

					throw new Error(
						`Unknown callback type: ${data.payload satisfies never}`,
					);
				})
				.then(() => {
					post(worker, {type: 'acknowledge-callback', nonce: data.nonce});
				})
				.catch((err) => {
					reject(err);
					post(worker, {
						type: 'signal-error-in-callback',
						nonce: data.nonce,
					});
				});
		}
	}

	worker.addEventListener('message', onMessage);
	controller?.addEventListener('abort', onAbort);
	controller?.addEventListener('resume', onResume);
	controller?.addEventListener('pause', onPause);

	function cleanup() {
		worker.removeEventListener('message', onMessage);
		controller?.removeEventListener('abort', onAbort);
		controller?.removeEventListener('resume', onResume);
		controller?.removeEventListener('pause', onPause);

		worker.terminate();
	}

	const val = await promise;

	cleanup();
	return val as Promise<ParseMediaResult<F>>;
};
