import type {InputFormat} from 'mediabunny';
import {
	ALL_FORMATS,
	AudioSampleSink,
	EncodedPacketSink,
	Input,
	MATROSKA,
	UrlSource,
	VideoSampleSink,
	WEBM,
} from 'mediabunny';
import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import {canBrowserUseWebGl2} from '../browser-can-use-webgl2';
import {getDurationOrCompute} from '../get-duration-or-compute';
import {resolveAudioTrack} from '../helpers/resolve-audio-track';
import {isNetworkError} from '../is-type-of-error';
import {getMaxSourceCacheSize} from '../max-cache-size';
import type {MediaRequestInit} from '../request-init';
import {resolveRequestInit} from '../request-init';
import {rememberActualMatroskaTimestamps} from './remember-actual-matroska-timestamps';

type VideoSinks = {
	sampleSink: VideoSampleSink;
};

type AudioSinks = {
	sampleSink: AudioSampleSink;
	sampleRate: number;
	numberOfChannels: number;
};

export type AudioSinkResult =
	| AudioSinks
	| 'no-audio-track'
	| 'cannot-decode-audio'
	| 'unknown-container-format'
	| 'network-error';
export type VideoSinkResult =
	| VideoSinks
	| 'no-video-track'
	| 'cannot-decode'
	| 'cannot-decode-prores'
	| 'cannot-decode-alpha'
	| 'unknown-container-format'
	| 'network-error';

export const makeSinks = (
	src: string,
	logLevel: LogLevel,
	credentials: RequestCredentials | undefined,
	requestInit?: MediaRequestInit,
) => {
	const resolvedRequestInit = resolveRequestInit({credentials, requestInit});
	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(src, {
			handleUnhandledError: (error) => {
				Internals.Log.warn(
					{logLevel, tag: '@remotion/media'},
					`A speculative fetch for "${src}" failed:`,
					error,
				);
			},
			maxCacheSize: getMaxSourceCacheSize(logLevel),
			...(resolvedRequestInit ? {requestInit: resolvedRequestInit} : undefined),
		}),
	});
	const getSinks = async () => {
		let format: InputFormat | null = null;
		let formatDetectionError: Error | null = null;
		try {
			format = await input.getFormat();
		} catch (error) {
			formatDetectionError = error as Error;
		}

		const isNetworkFailure =
			formatDetectionError !== null && isNetworkError(formatDetectionError);
		const isMatroska = format === MATROSKA || format === WEBM;

		const getVideoSinks = async (): Promise<VideoSinkResult> => {
			if (isNetworkFailure) {
				return 'network-error';
			}

			if (format === null) {
				return 'unknown-container-format';
			}

			const videoTrack = await input.getPrimaryVideoTrack();
			if (!videoTrack) {
				return 'no-video-track';
			}

			if (await videoTrack.isLive()) {
				throw new Error(
					'Live streams are not currently supported by Remotion. Sorry! Source: ' +
						src,
				);
			}

			if (await videoTrack.isRelativeToUnixEpoch()) {
				throw new Error(
					'Streams with UNIX timestamps are not currently supported by Remotion. Sorry! Source: ' +
						src,
				);
			}

			const canDecode = await videoTrack.canDecode();

			if (!canDecode) {
				if (videoTrack.codec === 'prores') {
					return 'cannot-decode-prores';
				}

				return 'cannot-decode';
			}

			const sampleSink = new VideoSampleSink(videoTrack);
			const packetSink = new EncodedPacketSink(videoTrack);

			// Try to get the keypacket at the requested timestamp.
			// If it returns null (timestamp is before the first keypacket), fall back to the first packet.
			// This matches mediabunny's internal behavior and handles videos that don't start at timestamp 0.
			const startPacket = await packetSink.getFirstPacket({
				verifyKeyPackets: true,
			});

			const hasAlpha = startPacket?.sideData.alpha;
			if (hasAlpha && !canBrowserUseWebGl2()) {
				Internals.Log.warn(
					{logLevel, tag: '@remotion/media'},
					`WebGL2 is not available, using the non-fast CPU path to decode alpha for ${src}.`,
				);
			}

			return {
				sampleSink,
			};
		};

		let videoSinksPromise: Promise<VideoSinkResult> | null = null;
		const getVideoSinksPromise = () => {
			if (videoSinksPromise) {
				return videoSinksPromise;
			}

			videoSinksPromise = getVideoSinks();
			return videoSinksPromise;
		};

		// audioSinksPromise is now a record indexed by audio track index
		const audioSinksPromise: Record<
			number,
			Promise<AudioSinkResult> | undefined
		> = {};

		const getAudioSinks = async (
			index: number | null,
		): Promise<AudioSinkResult> => {
			if (isNetworkFailure) {
				return 'network-error';
			}

			if (format === null) {
				return 'unknown-container-format';
			}

			const [videoTrack, audioTracks] = await Promise.all([
				input.getPrimaryVideoTrack(),
				input.getAudioTracks(),
			]);

			const audioTrack = await resolveAudioTrack({
				videoTrack,
				audioTracks,
				audioStreamIndex: index,
			});

			if (!audioTrack) {
				return 'no-audio-track';
			}

			const canDecode = await audioTrack.canDecode();

			if (!canDecode) {
				return 'cannot-decode-audio';
			}

			return {
				sampleSink: new AudioSampleSink(audioTrack),
				sampleRate: await audioTrack.getSampleRate(),
				numberOfChannels: await audioTrack.getNumberOfChannels(),
			};
		};

		const getAudioSinksPromise = (index: number | null) => {
			const keyIndex = index === null ? -1 : index;
			if (audioSinksPromise[keyIndex]) {
				return audioSinksPromise[keyIndex];
			}

			audioSinksPromise[keyIndex] = getAudioSinks(index);
			return audioSinksPromise[keyIndex];
		};

		return {
			formatDetectionError,
			getVideo: () => getVideoSinksPromise(),
			getAudio: (index: number | null) => getAudioSinksPromise(index),
			actualMatroskaTimestamps: rememberActualMatroskaTimestamps(isMatroska),
			isMatroska,
			getDuration: () => {
				return getDurationOrCompute(input);
			},
		};
	};

	return {
		promise: getSinks(),
		dispose: () => input.dispose(),
	};
};

export type GetSink = Awaited<ReturnType<typeof makeSinks>['promise']>;
