import type {
	MediaParserAudioTrack,
	MediaParserLogLevel,
	MediaParserOnAudioSample,
} from '@remotion/media-parser';
import {MediaParserInternals} from '@remotion/media-parser';
import {getAudioDecoderConfig} from './audio-decoder-config';
import {createAudioEncoder} from './audio-encoder';
import {getAudioEncoderConfig} from './audio-encoder-config';
import {convertEncodedChunk} from './convert-encoded-chunk';
import type {ConvertMediaOnAudioData} from './convert-media';
import {internalCreateAudioDecoder} from './create-audio-decoder';
import type {MediaFn} from './create/media-fn';
import type {ProgressTracker} from './create/progress-tracker';
import {Log} from './log';
import type {AudioOperation} from './on-audio-track-handler';
import {processingQueue} from './processing-queue';
import type {ConvertMediaProgressFn} from './throttled-state-update';
import type {WebCodecsController} from './webcodecs-controller';

export const reencodeAudioTrack = async ({
	audioOperation,
	track,
	logLevel,
	abortConversion,
	state,
	controller,
	onMediaStateUpdate,
	onAudioData,
	progressTracker,
}: {
	audioOperation: AudioOperation;
	track: MediaParserAudioTrack;
	logLevel: MediaParserLogLevel;
	abortConversion: (errCause: Error) => void;
	state: MediaFn;
	controller: WebCodecsController;
	onMediaStateUpdate: null | ConvertMediaProgressFn;
	onAudioData: ConvertMediaOnAudioData | null;
	progressTracker: ProgressTracker;
}): Promise<MediaParserOnAudioSample | null> => {
	if (audioOperation.type !== 'reencode') {
		throw new Error(
			`Audio track with ID ${track.trackId} could not be resolved with a valid operation. Received ${JSON.stringify(
				audioOperation,
			)}, but must be either "copy", "reencode", "drop" or "fail"`,
		);
	}

	const audioEncoderConfig = await getAudioEncoderConfig({
		numberOfChannels: track.numberOfChannels,
		sampleRate: audioOperation.sampleRate ?? track.sampleRate,
		codec: audioOperation.audioCodec,
		bitrate: audioOperation.bitrate,
	});
	const audioDecoderConfig = await getAudioDecoderConfig({
		codec: track.codec,
		numberOfChannels: track.numberOfChannels,
		sampleRate: track.sampleRate,
		description: track.description,
	});

	Log.verbose(logLevel, 'Audio encoder config', audioEncoderConfig);
	Log.verbose(logLevel, 'Audio decoder config', audioDecoderConfig ?? track);

	if (!audioEncoderConfig) {
		abortConversion(
			new Error(`Could not configure audio encoder of track ${track.trackId}`),
		);
		return null;
	}

	if (!audioDecoderConfig) {
		abortConversion(
			new Error(`Could not configure audio decoder of track ${track.trackId}`),
		);
		return null;
	}

	const codecPrivate =
		audioOperation.audioCodec === 'aac'
			? MediaParserInternals.createAacCodecPrivate({
					audioObjectType: 2,
					sampleRate:
						audioOperation.sampleRate ?? audioEncoderConfig.sampleRate,
					channelConfiguration: audioEncoderConfig.numberOfChannels,
					codecPrivate: null,
				})
			: null;

	const {trackNumber} = await state.addTrack({
		type: 'audio',
		codec:
			audioOperation.audioCodec === 'wav'
				? 'pcm-s16'
				: audioOperation.audioCodec,
		numberOfChannels: audioEncoderConfig.numberOfChannels,
		sampleRate: audioOperation.sampleRate ?? audioEncoderConfig.sampleRate,
		codecPrivate,
		timescale: track.originalTimescale,
	});

	const audioEncoder = createAudioEncoder({
		// This is weird 😵‍💫
		// Chrome completely ignores the sample rate and uses it's own
		// We cannot determine it here because it depends on the system
		// sample rate. Unhardcode then declare it later once we know.
		onNewAudioSampleRate: (sampleRate) => {
			state.updateTrackSampleRate({sampleRate, trackNumber});
		},
		onChunk: async (chunk) => {
			await state.addSample({
				chunk: convertEncodedChunk(chunk),
				trackNumber,
				isVideo: false,
				codecPrivate,
			});
			onMediaStateUpdate?.((prevState) => {
				return {
					...prevState,
					encodedAudioFrames: prevState.encodedAudioFrames + 1,
				};
			});
		},
		onError: (err) => {
			abortConversion(
				new Error(
					`Audio encoder of track ${track.trackId} failed (see .cause of this error)`,
					{
						cause: err,
					},
				),
			);
		},
		codec: audioOperation.audioCodec,
		controller,
		config: audioEncoderConfig,
		logLevel,
	});

	const audioProcessingQueue = processingQueue<AudioData>({
		controller,
		label: 'AudioData processing queue',
		logLevel,
		onError(error) {
			abortConversion(
				new Error(
					`Audio decoder of track ${track.trackId} failed. Config: ${JSON.stringify(audioDecoderConfig)} (see .cause of this error)`,
					{
						cause: error,
					},
				),
			);
		},
		onOutput: async (audioData) => {
			const newAudioData = onAudioData
				? await onAudioData?.({audioData, track})
				: audioData;
			if (newAudioData !== audioData) {
				if (newAudioData.duration !== audioData.duration) {
					throw new Error(
						`onAudioData returned a different duration than the input audio data. Original duration: ${audioData.duration}, new duration: ${newAudioData.duration}`,
					);
				}

				if (newAudioData.numberOfChannels !== audioData.numberOfChannels) {
					throw new Error(
						`onAudioData returned a different number of channels than the input audio data. Original channels: ${audioData.numberOfChannels}, new channels: ${newAudioData.numberOfChannels}`,
					);
				}

				if (newAudioData.sampleRate !== audioData.sampleRate) {
					throw new Error(
						`onAudioData returned a different sample rate than the input audio data. Original sample rate: ${audioData.sampleRate}, new sample rate: ${newAudioData.sampleRate}`,
					);
				}

				if (newAudioData.format !== audioData.format) {
					throw new Error(
						`onAudioData returned a different format than the input audio data. Original format: ${audioData.format}, new format: ${newAudioData.format}`,
					);
				}

				if (newAudioData.timestamp !== audioData.timestamp) {
					throw new Error(
						`onAudioData returned a different timestamp than the input audio data. Original timestamp: ${audioData.timestamp}, new timestamp: ${newAudioData.timestamp}`,
					);
				}

				audioData.close();
			}

			await controller._internals._mediaParserController._internals.checkForAbortAndPause();
			await audioEncoder.ioSynchronizer.waitForQueueSize(10);

			await controller._internals._mediaParserController._internals.checkForAbortAndPause();
			audioEncoder.encode(newAudioData);

			onMediaStateUpdate?.((prevState) => {
				return {
					...prevState,
					decodedAudioFrames: prevState.decodedAudioFrames + 1,
				};
			});

			newAudioData.close();
		},
	});

	const audioDecoder = await internalCreateAudioDecoder({
		onFrame: async (audioData) => {
			await controller._internals._mediaParserController._internals.checkForAbortAndPause();

			await audioProcessingQueue.ioSynchronizer.waitForQueueSize(10);
			audioProcessingQueue.input(audioData);
		},
		onError(error) {
			abortConversion(
				new Error(
					`Audio decoder of track ${track.trackId} failed. Config: ${JSON.stringify(audioDecoderConfig)} (see .cause of this error)`,
					{
						cause: error,
					},
				),
			);
		},
		controller,
		config: audioDecoderConfig,
		logLevel,
	});

	state.addWaitForFinishPromise(async () => {
		Log.verbose(logLevel, 'Waiting for audio decoder to finish');
		await audioDecoder.flush();
		Log.verbose(logLevel, 'Audio decoder finished');
		audioDecoder.close();
		await audioProcessingQueue.ioSynchronizer.waitForQueueSize(0);
		Log.verbose(logLevel, 'Audio processing queue finished');
		await audioEncoder.waitForFinish();
		Log.verbose(logLevel, 'Audio encoder finished');
		audioEncoder.close();
	});

	return async (audioSample) => {
		progressTracker.setPossibleLowestTimestamp(
			Math.min(
				audioSample.timestamp,
				audioSample.decodingTimestamp ?? Infinity,
			),
		);

		await controller._internals._mediaParserController._internals.checkForAbortAndPause();
		await audioDecoder.waitForQueueToBeLessThan(10);

		audioDecoder.decode(audioSample);
	};
};
