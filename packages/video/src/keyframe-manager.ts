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

		// TODO: Delete banks of other sources

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

	const getKeyframeBankOrRefetch = async ({
		packetSink,
		timestamp,
		videoSampleSink,
		src,
		sources,
	}: {
		packetSink: EncodedPacketSink;
		timestamp: number;
		videoSampleSink: VideoSampleSink;
		src: string;
		sources: Record<string, Record<number, KeyframeBank>>;
	}) => {
		const startPacket = await packetSink.getKeyPacket(timestamp, {
			verifyKeyPackets: true,
		});

		if (!startPacket) {
			throw new Error(`No key packet found for timestamp ${timestamp}`);
		}

		const startTimestamp = startPacket.timestamp;
		const existingBank = sources[src]?.[startTimestamp];

		// Bank does not yet exist, we need to fetch
		if (!existingBank) {
			const newKeyframeBank = await getFramesSinceKeyframe({
				packetSink,
				videoSampleSink,
				startPacket,
			});

			addKeyframeBank({src, bank: newKeyframeBank});

			return newKeyframeBank;
		}

		// Bank exists and still has the frame we want
		if (existingBank.hasTimestampInSecond()) {
			return existingBank;
		}

		// Bank exists but frames have already been evicted!
		// First delete it entirely
		existingBank.prepareForDeletion();
		delete sources[src][startTimestamp];

		// Then refetch
		const replacementKeybank = await getFramesSinceKeyframe({
			packetSink,
			videoSampleSink,
			startPacket,
		});

		addKeyframeBank({src, bank: replacementKeybank});

		return replacementKeybank;
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

		const keyframeBank = await getKeyframeBankOrRefetch({
			packetSink,
			timestamp,
			videoSampleSink,
			src,
			sources,
		});

		return keyframeBank;
	};

	return {
		requestKeyframeBank,
		addKeyframeBank,
	};
};

export type KeyframeManager = Awaited<ReturnType<typeof makeKeyframeManager>>;
