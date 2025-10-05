import type {EncodedPacket, UrlSourceOptions} from 'mediabunny';
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
import {makeKeyframeBank} from './keyframe-bank';
import {rememberActualMatroskaTimestamps} from './remember-actual-matroska-timestamps';

type VideoSinks = {
	sampleSink: VideoSampleSink;
	packetSink: EncodedPacketSink;
};

type AudioSinks = {
	sampleSink: AudioSampleSink;
};

export type AudioSinkResult =
	| AudioSinks
	| 'no-audio-track'
	| 'cannot-decode-audio'
	| 'unknown-container-format';
export type VideoSinkResult =
	| VideoSinks
	| 'no-video-track'
	| 'cannot-decode'
	| 'unknown-container-format';

const getRetryDelay = (() => {
	return null;
}) satisfies UrlSourceOptions['getRetryDelay'];

const getFormatOrNull = async (input: Input) => {
	try {
		return await input.getFormat();
	} catch {
		return null;
	}
};

export const getSinks = async (src: string) => {
	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(src, {
			getRetryDelay,
		}),
	});

	const format = await getFormatOrNull(input);
	const isMatroska = format === MATROSKA || format === WEBM;

	const getVideoSinks = async (): Promise<VideoSinkResult> => {
		if (format === null) {
			return 'unknown-container-format';
		}

		const videoTrack = await input.getPrimaryVideoTrack();
		if (!videoTrack) {
			return 'no-video-track';
		}

		const canDecode = await videoTrack.canDecode();

		if (!canDecode) {
			return 'cannot-decode';
		}

		return {
			sampleSink: new VideoSampleSink(videoTrack),
			packetSink: new EncodedPacketSink(videoTrack),
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

	const getAudioSinks = async (index: number): Promise<AudioSinkResult> => {
		if (format === null) {
			return 'unknown-container-format';
		}

		const audioTracks = await input.getAudioTracks();
		const audioTrack = audioTracks[index];

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

	const getAudioSinksPromise = (index: number) => {
		if (audioSinksPromise[index]) {
			return audioSinksPromise[index];
		}

		audioSinksPromise[index] = getAudioSinks(index);
		return audioSinksPromise[index];
	};

	return new WeakRef({
		getVideo: () => getVideoSinksPromise(),
		getAudio: (index: number) => getAudioSinksPromise(index),
		actualMatroskaTimestamps: rememberActualMatroskaTimestamps(isMatroska),
		isMatroska,
		getDuration: () => input.computeDuration(),
	});
};

export type GetSink = Awaited<ReturnType<typeof getSinks>>;

export const getFramesSinceKeyframe = async ({
	packetSink,
	videoSampleSink,
	startPacket,
}: {
	packetSink: EncodedPacketSink;
	videoSampleSink: VideoSampleSink;
	startPacket: EncodedPacket;
}) => {
	const nextKeyPacket = await packetSink.getNextKeyPacket(startPacket, {
		verifyKeyPackets: true,
	});

	const sampleIterator = videoSampleSink.samples(
		startPacket.timestamp,
		nextKeyPacket ? nextKeyPacket.timestamp : Infinity,
	);

	const keyframeBank = makeKeyframeBank({
		startTimestampInSeconds: startPacket.timestamp,
		endTimestampInSeconds: nextKeyPacket ? nextKeyPacket.timestamp : Infinity,
		sampleIterator,
	});

	return keyframeBank;
};
