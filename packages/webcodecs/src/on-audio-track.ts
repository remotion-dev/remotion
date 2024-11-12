import type {LogLevel, MediaFn, OnAudioTrack} from '@remotion/media-parser';
import {createAudioDecoder} from './audio-decoder';
import {getAudioDecoderConfig} from './audio-decoder-config';
import {createAudioEncoder} from './audio-encoder';
import {getAudioEncoderConfig} from './audio-encoder-config';
import type {ConvertMediaAudioCodec} from './codec-id';
import {convertEncodedChunk} from './convert-encoded-chunk';
import type {ConvertMediaContainer, ConvertMediaState} from './convert-media';
import {defaultOnAudioTrackHandler} from './default-on-audio-track-handler';
import Error from './error-cause';
import type {ConvertMediaOnAudioTrackHandler} from './on-audio-track-handler';

export const makeAudioTrackHandler =
	({
		state,
		defaultAudioCodec: audioCodec,
		convertMediaState,
		controller,
		abortConversion,
		onMediaStateUpdate,
		onAudioTrack,
		logLevel,
		container,
	}: {
		state: MediaFn;
		defaultAudioCodec: ConvertMediaAudioCodec | null;
		convertMediaState: ConvertMediaState;
		controller: AbortController;
		abortConversion: (errCause: Error) => void;
		onMediaStateUpdate: null | ((state: ConvertMediaState) => void);
		onAudioTrack: ConvertMediaOnAudioTrackHandler | null;
		logLevel: LogLevel;
		container: ConvertMediaContainer;
	}): OnAudioTrack =>
	async (track) => {
		const audioOperation = await (onAudioTrack ?? defaultOnAudioTrackHandler)({
			defaultAudioCodec: audioCodec,
			track,
			logLevel,
			container,
		});

		if (audioOperation.type === 'drop') {
			return null;
		}

		if (audioOperation.type === 'fail') {
			throw new Error(
				`Audio track with ID ${track.trackId} could resolved with {"type": "fail"}. This could mean that this audio track could neither be copied to the output container or re-encoded. You have the option to drop the track instead of failing it: https://remotion.dev/docs/webcodecs/track-transformation`,
			);
		}

		if (audioOperation.type === 'copy') {
			const addedTrack = await state.addTrack({
				type: 'audio',
				codec: track.codecWithoutConfig,
				numberOfChannels: track.numberOfChannels,
				sampleRate: track.sampleRate,
				codecPrivate: track.codecPrivate,
			});

			return async (audioSample) => {
				await state.addSample(audioSample, addedTrack.trackNumber, false);
				convertMediaState.encodedAudioFrames++;
				onMediaStateUpdate?.({...convertMediaState});
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

		const {trackNumber} = await state.addTrack({
			type: 'audio',
			codec: audioOperation.audioCodec,
			numberOfChannels: track.numberOfChannels,
			sampleRate: track.sampleRate,
			codecPrivate: null,
		});

		const audioEncoder = createAudioEncoder({
			onChunk: async (chunk) => {
				await state.addSample(convertEncodedChunk(chunk), trackNumber, false);
				convertMediaState.encodedAudioFrames++;
				onMediaStateUpdate?.({...convertMediaState});
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
		});

		const audioDecoder = createAudioDecoder({
			onFrame: async (frame) => {
				await audioEncoder.encodeFrame(frame);
				convertMediaState.decodedAudioFrames++;
				onMediaStateUpdate?.(convertMediaState);

				frame.close();
			},
			onError(error) {
				abortConversion(
					new Error(
						`Audio decoder of track ${track.trackId} failed (see .cause of this error)`,
						{
							cause: error,
						},
					),
				);
			},
			signal: controller.signal,
			config: audioDecoderConfig,
			logLevel,
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
