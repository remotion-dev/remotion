import {
	defaultSelectM3uAssociatedPlaylists,
	defaultSelectM3uStreamFn,
} from './containers/m3u/select-stream';
import {fetchReader} from './fetch';
import {internalParseMedia} from './internal-parse-media';
import {mediaParserController} from './media-parser-controller';
import {forwardMediaParserControllerToWorker} from './worker/forward-controller';
import {serializeError} from './worker/serialize-error';
import type {
	ParseMediaOnWorker,
	ResponseCallbackPayload,
	WorkerRequestPayload,
	WorkerResponsePayload,
} from './worker/worker-types';

const post = (message: WorkerResponsePayload) => {
	postMessage(message);
};

const controller = mediaParserController();

const executeCallback = async (payload: ResponseCallbackPayload) => {
	const nonce = crypto.randomUUID();
	const {promise, resolve, reject} = Promise.withResolvers<void>();

	const cb = (msg: MessageEvent) => {
		const data = msg.data as WorkerRequestPayload;
		if (data.type === 'acknowledge-callback' && data.nonce === nonce) {
			resolve();
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

	await promise;
};

const startParsing = async (message: ParseMediaOnWorker) => {
	const {
		src,
		fields,
		acknowledgeRemotionLicense,
		logLevel: userLogLevel,
		onAudioTrack,
		onDimensions,
		onDurationInSeconds,
		onFps,
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
		onParseProgress,
		onRotation,
		onSampleRate,
		onSize,
		onSlowAudioBitrate,
		onSlowDurationInSeconds,
		onSlowFps,
		onSlowKeyframes,
		onSlowNumberOfFrames,
		onSlowVideoBitrate,
		onStructure,
		onTracks,
		onUnrotatedDimensions,
		onVideoCodec,
		onVideoTrack,
		progressIntervalInMs,
		selectM3uStream,
		mp4HeaderSegment,
		selectM3uAssociatedPlaylists,
	} = message.payload;

	const {postAudioCodec, postContainer} = message;

	const logLevel = userLogLevel ?? 'info';

	try {
		const ret = await internalParseMedia({
			src,
			// TODO: Reader should be dynamic
			reader: fetchReader,
			acknowledgeRemotionLicense: Boolean(acknowledgeRemotionLicense),
			onError: () => ({action: 'fail'}),
			logLevel,
			fields: fields ?? null,
			apiName: 'parseMediaInWorker()',
			controller,
			mode: 'query',
			// TODO: Callback for on Audio track
			onAudioTrack: onAudioTrack ?? null,

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
			onDimensions: onDimensions ?? null,
			onDiscardedData: null,
			onDurationInSeconds: onDurationInSeconds ?? null,
			onFps: onFps ?? null,
			onImages: onImages ?? null,
			onInternalStats: onInternalStats ?? null,
			onIsHdr: onIsHdr ?? null,
			onKeyframes: onKeyframes ?? null,
			onLocation: onLocation ?? null,
			onM3uStreams: onM3uStreams ?? null,
			onMetadata: onMetadata ?? null,
			onMimeType: onMimeType ?? null,
			onName: onName ?? null,
			onNumberOfAudioChannels: onNumberOfAudioChannels ?? null,
			onRotation: onRotation ?? null,
			onSampleRate: onSampleRate ?? null,
			onSize: onSize ?? null,
			onSlowAudioBitrate: onSlowAudioBitrate ?? null,
			onSlowDurationInSeconds: onSlowDurationInSeconds ?? null,
			onSlowFps: onSlowFps ?? null,
			onSlowKeyframes: onSlowKeyframes ?? null,
			onSlowNumberOfFrames: onSlowNumberOfFrames ?? null,
			onSlowVideoBitrate: onSlowVideoBitrate ?? null,
			onStructure: onStructure ?? null,
			onTracks: onTracks ?? null,
			onParseProgress: onParseProgress ?? null,
			onUnrotatedDimensions: onUnrotatedDimensions ?? null,
			onVideoCodec: onVideoCodec ?? null,
			onVideoTrack: onVideoTrack ?? null,
			progressIntervalInMs: progressIntervalInMs ?? null,
			selectM3uStream: selectM3uStream ?? defaultSelectM3uStreamFn,
			mp4HeaderSegment: mp4HeaderSegment ?? null,
			selectM3uAssociatedPlaylists:
				selectM3uAssociatedPlaylists ?? defaultSelectM3uAssociatedPlaylists,
		});
		post({
			type: 'response-done',
			payload: ret,
		});
	} catch (e) {
		post(serializeError(e as Error, logLevel));
	}
};

const onMessageForWorker = forwardMediaParserControllerToWorker(controller);

addEventListener('message', (message) => {
	const data = message.data as WorkerRequestPayload;

	if (data.type === 'request-worker') {
		startParsing(data);
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
});
