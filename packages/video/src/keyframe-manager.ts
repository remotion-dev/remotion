import type {EncodedPacketSink, VideoSampleSink} from 'mediabunny';
import {getFramesSinceKeyframe} from './get-frames-since-keyframe';
import {type KeyframeBank} from './keyframe-bank';
import type {LogLevel} from './log';
import {Log} from './log';

export const makeKeyframeManager = () => {
	// src => {[startTimestampInSeconds]: KeyframeBank
	const sources: Record<string, Record<number, KeyframeBank>> = {};

	const addKeyframeBank = ({src, bank}: {src: string; bank: KeyframeBank}) => {
		sources[src] = sources[src] ?? {};
		sources[src][bank.startTimestampInSeconds] = bank;
	};

	const clearKeyframeBanksBeforeTime = ({
		timestampInSeconds,
		src,
		logLevel,
	}: {
		timestampInSeconds: number;
		src: string;
		logLevel: LogLevel;
	}) => {
		// TODO: make it dependent on the fps and concurrency
		const SAFE_BACK_WINDOW_IN_SECONDS = 1;
		const threshold = timestampInSeconds - SAFE_BACK_WINDOW_IN_SECONDS;
		if (!sources[src]) {
			return;
		}

		const banks = Object.keys(sources[src]);

		for (const startTimeInSeconds of banks) {
			const bank = sources[src][startTimeInSeconds as unknown as number];
			const {endTimestampInSeconds} = bank;

			if (endTimestampInSeconds < threshold) {
				bank.prepareForDeletion();
				Log.verbose(
					logLevel,
					`Cleared frames for src ${src} from ${bank.startTimestampInSeconds}sec to ${bank.endTimestampInSeconds}sec`,
				);
				delete sources[src][startTimeInSeconds as unknown as number];
			}
		}
	};

	const requestKeyframeBank = async ({
		packetSink,
		timestamp,
		videoSampleSink,
		src,
		logLevel,
	}: {
		timestamp: number;
		packetSink: EncodedPacketSink;
		videoSampleSink: VideoSampleSink;
		src: string;
		logLevel: LogLevel;
	}) => {
		clearKeyframeBanksBeforeTime({
			timestampInSeconds: timestamp,
			src,
			logLevel,
		});

		const packet = await packetSink.getKeyPacket(timestamp, {
			verifyKeyPackets: true,
		});

		if (!packet) {
			throw new Error(`No key packet found for timestamp ${timestamp}`);
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
