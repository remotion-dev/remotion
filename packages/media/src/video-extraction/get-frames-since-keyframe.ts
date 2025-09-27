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

export const getSinks = async (src: string) => {
	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(src),
	});

	const format = await input.getFormat();

	const videoTrack = await input.getPrimaryVideoTrack();

	const audioTrack = await input.getPrimaryAudioTrack();
	const isMatroska = format === MATROSKA;

	return new WeakRef({
		video: videoTrack
			? {
					sampleSink: new VideoSampleSink(videoTrack),
					packetSink: new EncodedPacketSink(videoTrack),
				}
			: null,
		audio: audioTrack
			? {
					sampleSink: new AudioSampleSink(audioTrack),
				}
			: null,
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
