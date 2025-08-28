import {
	ALL_FORMATS,
	EncodedPacketSink,
	Input,
	UrlSource,
	VideoSampleSink,
} from 'mediabunny';

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
	timestamp,
}: {
	packetSink: EncodedPacketSink;
	videoSampleSink: VideoSampleSink;
	timestamp: number;
}) => {
	const packet = await packetSink.getKeyPacket(timestamp, {
		verifyKeyPackets: true,
	});
	if (!packet) {
		throw new Error('No packet found');
	}

	const packet2 = await packetSink.getNextKeyPacket(packet, {
		verifyKeyPackets: true,
	});
	if (!packet2) {
		throw new Error('No packet found');
	}

	const samples = videoSampleSink.samples(packet.timestamp, packet2.timestamp);

	return samples;
};
