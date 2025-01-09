import {
	MediaParserInternals,
	type LogLevel,
	type OnAudioTrack,
} from '@remotion/media-parser';
import {createAudioDecoder} from './audio-decoder';
import {getAudioDecoderConfig} from './audio-decoder-config';
import {createAudioEncoder} from './audio-encoder';
import {getAudioEncoderConfig} from './audio-encoder-config';
import {canCopyAudioTrack} from './can-copy-audio-track';
import {convertEncodedChunk} from './convert-encoded-chunk';
import type {MediaFn} from './create/media-fn';
import type {ProgressTracker} from './create/progress-tracker';
import {defaultOnAudioTrackHandler} from './default-on-audio-track-handler';
import Error from './error-cause';
import type {ConvertMediaAudioCodec} from './get-available-audio-codecs';
import type {ConvertMediaContainer} from './get-available-containers';
import {getDefaultAudioCodec} from './get-default-audio-codec';
import {Log} from './log';
import type {ConvertMediaOnAudioTrackHandler} from './on-audio-track-handler';
import type {ConvertMediaProgressFn} from './throttled-state-update';

export const makeAudioTrackHandler =
	({
		state,
		defaultAudioCodec: audioCodec,
		controller,
		abortConversion,
		onMediaStateUpdate,
		onAudioTrack,
		logLevel,
		outputContainer,
		progressTracker,
	}: {
		state: MediaFn;
		defaultAudioCodec: ConvertMediaAudioCodec | null;
		controller: AbortController;
		abortConversion: (errCause: Error) => void;
		onMediaStateUpdate: null | ConvertMediaProgressFn;
		onAudioTrack: ConvertMediaOnAudioTrackHandler | null;
		logLevel: LogLevel;
		outputContainer: ConvertMediaContainer;
		progressTracker: ProgressTracker;
	}): OnAudioTrack =>
	async ({track, container: inputContainer}) => {
		const canCopyTrack = canCopyAudioTrack({
			inputCodec: track.codecWithoutConfig,
			outputContainer,
			inputContainer,
		});

		const audioOperation = await (onAudioTrack ?? defaultOnAudioTrackHandler)({
			defaultAudioCodec:
				audioCodec ?? getDefaultAudioCodec({container: outputContainer}),
			track,
			logLevel,
			outputContainer,
			inputContainer,
			canCopyTrack,
		});

		if (audioOperation.type === 'drop') {
			return null;
		}

		if (audioOperation.type === 'fail') {
			throw new Error(
				`Audio track with ID ${track.trackId} resolved with {"type": "fail"}. This could mean that this audio track could neither be copied to the output container or re-encoded. You have the option to drop the track instead of failing it: https://remotion.dev/docs/webcodecs/track-transformation`,
			);
		}

		if (audioOperation.type === 'copy') {
			const addedTrack = await state.addTrack({
				type: 'audio',
				codec: track.codecWithoutConfig,
				numberOfChannels: track.numberOfChannels,
				sampleRate: track.sampleRate,
				codecPrivate: track.codecPrivate,
				timescale: track.timescale,
			});
			Log.verbose(
				logLevel,
				`Copying audio track ${track.trackId} as track ${addedTrack.trackNumber}. Timescale = ${track.timescale}, codec = ${track.codecWithoutConfig} (${track.codec}) `,
			);

			return async (audioSample) => {
				await state.addSample({
					chunk: audioSample,
					trackNumber: addedTrack.trackNumber,
					isVideo: false,
					codecPrivate: track.codecPrivate,
				});
				onMediaStateUpdate?.((prevState) => {
					return {
						...prevState,
						encodedAudioFrames: prevState.encodedAudioFrames + 1,
					};
				});
			};
		}

		const audioEncoderConfig = await getAudioEncoderConfig({
			numberOfChannels: track.numberOfChannels,
			sampleRate: track.sampleRate,
			codec: audioOperation.audioCodec,
			bitrate: audioOperation.bitrate,
		});
		const audioDecoderConfig = await getAudioDecoderConfig({
			codec: track.codec,
			numberOfChannels: track.numberOfChannels,
			sampleRate: track.sampleRate,
			description: track.description,
		});

		if (!audioEncoderConfig) {
			abortConversion(
				new Error(
					`Could not configure audio encoder of track ${track.trackId}`,
				),
			);
			return null;
		}

		if (!audioDecoderConfig) {
			abortConversion(
				new Error(
					`Could not configure audio decoder of track ${track.trackId}`,
				),
			);
			return null;
		}

		const codecPrivate =
			audioOperation.audioCodec === 'aac'
				? MediaParserInternals.createAacCodecPrivate({
						audioObjectType: 2,
						sampleRate: track.sampleRate,
						channelConfiguration: track.numberOfChannels,
					})
				: null;

		const {trackNumber} = await state.addTrack({
			type: 'audio',
			codec:
				audioOperation.audioCodec === 'wav'
					? 'pcm-s16'
					: audioOperation.audioCodec,
			numberOfChannels: track.numberOfChannels,
			sampleRate: track.sampleRate,
			codecPrivate,
			timescale: track.timescale,
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
					chunk: convertEncodedChunk(chunk, trackNumber),
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
						`Audio encoder of ${track.trackId} failed (see .cause of this error)`,
						{
							cause: err,
						},
					),
				);
			},
			codec: audioOperation.audioCodec,
			signal: controller.signal,
			config: audioEncoderConfig,
			logLevel,
			progressTracker,
		});

		const audioDecoder = createAudioDecoder({
			onFrame: async (frame) => {
				await audioEncoder.encodeFrame(frame);
				onMediaStateUpdate?.((prevState) => {
					return {
						...prevState,
						decodedAudioFrames: prevState.decodedAudioFrames + 1,
					};
				});

				frame.close();
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
			signal: controller.signal,
			config: audioDecoderConfig,
			logLevel,
			track,
			progressTracker,
		});

		state.addWaitForFinishPromise(async () => {
			await audioDecoder.waitForFinish();
			await audioEncoder.waitForFinish();
			audioDecoder.close();
			audioEncoder.close();
		});

		return async (audioSample) => {
			await audioDecoder.processSample(audioSample);
		};
	};
