import type {OnAudioTrack, VideoTrack} from '@remotion/media-parser';
import {
	MediaParserInternals,
	parseMedia,
	type MediaFn,
	type OnVideoTrack,
} from '@remotion/media-parser';
import {webFsWriter} from '@remotion/media-parser/web-fs';
import {createAudioDecoder} from './audio-decoder';
import {createAudioEncoder} from './audio-encoder';
import {createVideoDecoder} from './video-decoder';
import {createVideoEncoder} from './video-encoder';

export type ConvertMediaState = {
	decodedVideoFrames: number;
	decodedAudioFrames: number;
	encodedVideoFrames: number;
	encodedAudioFrames: number;
	videoError: DOMException | null;
	audioError: DOMException | null;
};

export const convertMedia = async ({
	src,
	onVideoFrame,
	onMediaStateUpdate,
}: {
	src: string | File;
	onVideoFrame?: (inputFrame: VideoFrame, track: VideoTrack) => Promise<void>;
	onMediaStateUpdate?: (state: ConvertMediaState) => void;
}) => {
	const convertMediaState: ConvertMediaState = {
		decodedAudioFrames: 0,
		decodedVideoFrames: 0,
		encodedVideoFrames: 0,
		encodedAudioFrames: 0,
		audioError: null,
		videoError: null,
	};
	const state = await MediaParserInternals.createMedia(webFsWriter);

	const onVideoTrack =
		(mediaState: MediaFn): OnVideoTrack =>
		async (track) => {
			if (!mediaState) {
				throw new Error('mediaState is null');
			}

			const {trackNumber} = await mediaState.addTrack({
				type: 'video',
				color: {
					transferChracteristics: 'bt709',
					matrixCoefficients: 'bt709',
					primaries: 'bt709',
					fullRange: true,
				},
				width: track.codedWidth,
				height: track.codedHeight,
				codecId: 'V_VP8',
			});

			const videoEncoder = await createVideoEncoder({
				width: track.displayAspectWidth,
				height: track.displayAspectHeight,
				onChunk: async (chunk) => {
					await mediaState.addSample(chunk, trackNumber);
					const newDuration = Math.round(
						(chunk.timestamp + (chunk.duration ?? 0)) / 1000,
					);
					await mediaState.updateDuration(newDuration);
					convertMediaState.encodedVideoFrames++;
					onMediaStateUpdate?.({...convertMediaState});
				},
				onError: (err) => {
					// TODO: Do error handling
					console.log(err);
				},
			});
			if (videoEncoder === null) {
				convertMediaState.videoError = new DOMException(
					'Video encoder not supported',
				);
				onMediaStateUpdate?.({...convertMediaState});
				return null;
			}

			const videoDecoder = await createVideoDecoder({
				track,
				onFrame: async (frame) => {
					await onVideoFrame?.(frame, track);
					await videoEncoder.encodeFrame(frame);
					convertMediaState.decodedVideoFrames++;
					onMediaStateUpdate?.({...convertMediaState});
					frame.close();
				},
				onError: (err) => {
					// TODO: Do error handling
					console.log(err);
				},
			});
			if (videoDecoder === null) {
				convertMediaState.videoError = new DOMException(
					'Video decoder not supported',
				);
				onMediaStateUpdate?.({...convertMediaState});
				return null;
			}

			mediaState.addWaitForFinishPromise(async () => {
				await videoDecoder.waitForFinish();
				await videoEncoder.waitForFinish();
				videoDecoder.close();
				videoEncoder.close();
			});

			return async (chunk) => {
				await videoDecoder.processSample(chunk);
			};
		};

	const onAudioTrack =
		(mediaState: MediaFn): OnAudioTrack =>
		async (track) => {
			const {trackNumber} = await mediaState.addTrack({
				type: 'audio',
				codecId: 'A_OPUS',
				numberOfChannels: track.numberOfChannels,
				sampleRate: track.sampleRate,
			});

			const audioEncoder = await createAudioEncoder({
				onChunk: async (chunk) => {
					await mediaState.addSample(chunk, trackNumber);
					convertMediaState.encodedAudioFrames++;
					onMediaStateUpdate?.({...convertMediaState});
				},
				sampleRate: track.sampleRate,
				numberOfChannels: track.numberOfChannels,
				onError: (err) => {
					// TODO: Do error handling
					console.log(err);
				},
			});

			if (!audioEncoder) {
				convertMediaState.audioError = new DOMException(
					'Audio encoder not supported',
				);
				onMediaStateUpdate?.({...convertMediaState});
				return null;
			}

			const audioDecoder = await createAudioDecoder({
				track,
				onFrame: async (frame) => {
					await audioEncoder.encodeFrame(frame);

					convertMediaState.decodedAudioFrames++;
					onMediaStateUpdate?.(convertMediaState);
					frame.close();
				},
				onError(error) {
					// TODO: Do better error handling
					convertMediaState.audioError = error;
					onMediaStateUpdate?.({...convertMediaState});
				},
			});

			if (!audioDecoder) {
				convertMediaState.audioError = new DOMException(
					'Audio decoder not supported',
				);
				onMediaStateUpdate?.(convertMediaState);
				return null;
			}

			mediaState.addWaitForFinishPromise(async () => {
				await audioDecoder.waitForFinish();
				await audioEncoder.waitForFinish();
				audioDecoder.close();
				audioEncoder.close();
			});

			return async (audioSample) => {
				await audioDecoder.processSample(audioSample);
			};
		};

	await parseMedia({
		src,
		onVideoTrack: onVideoTrack(state),
		onAudioTrack: onAudioTrack(state),
	});

	await state.waitForFinish();
	return state.save;
};
