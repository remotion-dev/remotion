import type {MediaFn, OnAudioTrack} from '@remotion/media-parser';
import {createAudioDecoder} from './audio-decoder';
import {getAudioDecoderConfig} from './audio-decoder-config';
import {createAudioEncoder} from './audio-encoder';
import {getAudioEncoderConfig} from './audio-encoder-config';
import type {ConvertMediaAudioCodec} from './codec-id';
import type {ConvertMediaState} from './convert-media';
import Error from './error-cause';
import type {ResolveAudioActionFn} from './resolve-audio-action';
import {resolveAudioAction} from './resolve-audio-action';

export const makeAudioTrackHandler =
	({
		state,
		audioCodec,
		convertMediaState,
		controller,
		abortConversion,
		onMediaStateUpdate,
		onAudioTrack,
		bitrate,
	}: {
		state: MediaFn;
		audioCodec: ConvertMediaAudioCodec;
		convertMediaState: ConvertMediaState;
		controller: AbortController;
		abortConversion: (errCause: Error) => void;
		onMediaStateUpdate: null | ((state: ConvertMediaState) => void);
		onAudioTrack: ResolveAudioActionFn;
		bitrate: number;
	}): OnAudioTrack =>
	async (track) => {
		const audioEncoderConfig = await getAudioEncoderConfig({
			codec: audioCodec,
			numberOfChannels: track.numberOfChannels,
			sampleRate: track.sampleRate,
			bitrate,
		});
		const audioDecoderConfig = await getAudioDecoderConfig({
			codec: track.codec,
			numberOfChannels: track.numberOfChannels,
			sampleRate: track.sampleRate,
			description: track.description,
		});

		const audioOperation = await resolveAudioAction({
			audioDecoderConfig,
			audioEncoderConfig,
			audioCodec,
			track,
			resolverFunction: onAudioTrack,
		});

		if (audioOperation === 'drop') {
			return null;
		}

		if (audioOperation === 'copy') {
			const addedTrack = await state.addTrack({
				type: 'audio',
				codec: audioCodec,
				numberOfChannels: track.numberOfChannels,
				sampleRate: track.sampleRate,
				codecPrivate: track.codecPrivate,
			});

			return async (audioSample) => {
				await state.addSample(
					new EncodedAudioChunk(audioSample),
					addedTrack.trackNumber,
				);
				convertMediaState.encodedAudioFrames++;
				onMediaStateUpdate?.({...convertMediaState});
			};
		}

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
			codec: audioCodec,
			numberOfChannels: track.numberOfChannels,
			sampleRate: track.sampleRate,
			codecPrivate: null,
		});

		const audioEncoder = createAudioEncoder({
			onChunk: async (chunk) => {
				await state.addSample(chunk, trackNumber);
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
			codec: audioCodec,
			signal: controller.signal,
			config: audioEncoderConfig,
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
