import type {EncodedPacketSink, VideoSampleSink} from 'mediabunny';
import {getFramesSinceKeyframe} from './get-frames-since-keyframe';
import {type KeyframeBank} from './keyframe-bank';

export const makeKeyframeManager = () => {
	// src => {[startTimestamp]: KeyframeBank
	const sources: Record<string, Record<number, KeyframeBank>> = {};

	const addKeyframeBank = ({src, bank}: {src: string; bank: KeyframeBank}) => {
		sources[src] = sources[src] ?? {};
		sources[src][bank.startTimestamp] = bank;
	};

	const requestKeyframeBank = async ({
		packetSink,
		timestamp,
		videoSampleSink,
		src,
	}: {
		timestamp: number;
		packetSink: EncodedPacketSink;
		videoSampleSink: VideoSampleSink;
		src: string;
	}) => {
		const packet = await packetSink.getKeyPacket(timestamp, {
			verifyKeyPackets: true,
		});
		if (!packet) {
			throw new Error('No key packet found for timestamp ' + timestamp);
		}

		const startTimestamp = packet.timestamp;
		if (sources[src]?.[startTimestamp]) {
			return sources[src][startTimestamp];
		}

		const keyframeBank = await getFramesSinceKeyframe({
			packetSink,
			videoSampleSink,
			startPacket: packet,
		});

		addKeyframeBank({src, bank: keyframeBank});

		return keyframeBank;
	};

	return {
		requestKeyframeBank,
		addKeyframeBank,
	};
};

export type KeyframeManager = Awaited<ReturnType<typeof makeKeyframeManager>>;
