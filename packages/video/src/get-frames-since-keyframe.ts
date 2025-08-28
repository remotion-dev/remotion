import type {EncodedPacket} from 'mediabunny';
import {
	ALL_FORMATS,
	EncodedPacketSink,
	Input,
	UrlSource,
	VideoSampleSink,
} from 'mediabunny';
import {makeKeyframeBank} from './keyframe-bank';

export const getVideoSink = async (src: string) => {
	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(src),
	});

	const track = await input.getPrimaryVideoTrack();
	if (!track) {
		throw new Error(`No video track found for ${src}`);
	}

	const videoSampleSink = new VideoSampleSink(track);
	const packetSink = new EncodedPacketSink(track);

	return {videoSampleSink, packetSink};
};

export type GetSink = Awaited<ReturnType<typeof getVideoSink>>;

export const getFramesSinceKeyframe = async ({
	packetSink,
	videoSampleSink,
	startPacket,
}: {
	packetSink: EncodedPacketSink;
	videoSampleSink: VideoSampleSink;
	startPacket: EncodedPacket;
}) => {
	const packet2 = await packetSink.getNextKeyPacket(startPacket, {
		verifyKeyPackets: false,
	});

	const samples = videoSampleSink.samples(
		startPacket.timestamp,
		packet2 ? packet2.timestamp : Infinity,
	);

	const keyframeBank = makeKeyframeBank({
		startTimestampInSeconds: startPacket.timestamp,
		endTimestampInSeconds: packet2 ? packet2.timestamp : Infinity,
		sampleIterator: samples,
	});

	return keyframeBank;
};
