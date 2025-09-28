import type {EncodedPacket} from 'mediabunny';
import {
	ALL_FORMATS,
	AudioSampleSink,
	EncodedPacketSink,
	Input,
	MATROSKA,
	UrlSource,
	VideoSampleSink,
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
	| 'cannot-decode-audio';
export type VideoSinkResult = VideoSinks | 'no-video-track' | 'cannot-decode';

export const getSinks = async (src: string) => {
	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(src),
	});

	const format = await input.getFormat();
	const isMatroska = format === MATROSKA;

	const getVideoSinks = async (): Promise<VideoSinkResult> => {
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

	let audioSinksPromise: Promise<AudioSinkResult> | null = null;

	const getAudioSinks = async (): Promise<AudioSinkResult> => {
		const audioTrack = await input.getPrimaryAudioTrack();
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

	const getAudioSinksPromise = () => {
		if (audioSinksPromise) {
			return audioSinksPromise;
		}

		audioSinksPromise = getAudioSinks();
		return audioSinksPromise;
	};

	return new WeakRef({
		getVideo: () => getVideoSinksPromise(),
		getAudio: () => getAudioSinksPromise(),
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
