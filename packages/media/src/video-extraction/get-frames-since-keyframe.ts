import type {InputFormat, UrlSourceOptions} from 'mediabunny';
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
import {canBrowserUseWebGl2} from '../browser-can-use-webgl2';
import {getDurationOrCompute} from '../get-duration-or-compute';
import {resolveAudioTrack} from '../helpers/resolve-audio-track';
import {isNetworkError} from '../is-type-of-error';
import {rememberActualMatroskaTimestamps} from './remember-actual-matroska-timestamps';

type VideoSinks = {
	sampleSink: VideoSampleSink;
};

type AudioSinks = {
	sampleSink: AudioSampleSink;
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
	| 'cannot-decode-alpha'
	| 'unknown-container-format'
	| 'network-error';

const getRetryDelay = (() => {
	return null;
}) satisfies UrlSourceOptions['getRetryDelay'];

const getFormatOrNullOrNetworkError = async (
	input: Input,
): Promise<InputFormat | 'network-error' | null> => {
	try {
		return await input.getFormat();
	} catch (err) {
		if (isNetworkError(err as Error)) {
			return 'network-error';
		}

		return null;
	}
};

export const getSinks = async (
	src: string,
	credentials: RequestCredentials | undefined,
) => {
	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(src, {
			getRetryDelay,
			...(credentials ? {requestInit: {credentials}} : undefined),
		}),
	});

	const format = await getFormatOrNullOrNetworkError(input);
	const isMatroska = format === MATROSKA || format === WEBM;

	const getVideoSinks = async (): Promise<VideoSinkResult> => {
		if (format === 'network-error') {
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
			return 'cannot-decode-alpha';
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
		if (format === null) {
			return 'unknown-container-format';
		}

		if (format === 'network-error') {
			return 'network-error';
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
		getVideo: () => getVideoSinksPromise(),
		getAudio: (index: number | null) => getAudioSinksPromise(index),
		actualMatroskaTimestamps: rememberActualMatroskaTimestamps(isMatroska),
		isMatroska,
		getDuration: () => {
			return getDurationOrCompute(input);
		},
	};
};

export type GetSink = Awaited<ReturnType<typeof getSinks>>;
