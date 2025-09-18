import type {EncodedPacketSink, VideoSampleSink} from 'mediabunny';
import {getFramesSinceKeyframe} from './get-frames-since-keyframe';
import {framesOpen, type KeyframeBank} from './keyframe-bank';
import type {LogLevel} from './log';
import {Log} from './log';

export const makeKeyframeManager = () => {
	// src => {[startTimestampInSeconds]: KeyframeBank
	const sources: Record<string, Record<number, Promise<KeyframeBank>>> = {};

	const addKeyframeBank = ({
		src,
		bank,
		startTimestampInSeconds,
	}: {
		src: string;
		bank: Promise<KeyframeBank>;
		startTimestampInSeconds: number;
	}) => {
		sources[src] = sources[src] ?? {};
		sources[src][startTimestampInSeconds] = bank;
	};

	const logCacheStats = async (logLevel: LogLevel) => {
		let count = 0;
		let totalSize = 0;
		for (const src in sources) {
			for (const bank in sources[src]) {
				const v = await sources[src][bank];
				const {length, size, timestamps, allocationSizes} =
					v.getOpenFrameCount();
				count += length;
				totalSize += size;
				if (size === 0) {
					continue;
				}

				Log.verbose(
					logLevel,
					`[NewVideo] Open frames for src ${src}: ${timestamps.join(', ')}, ${allocationSizes.join(', ')}`,
				);
			}
		}

		Log.verbose(
			logLevel,
			`[NewVideo] Cache stats: ${count} open frames, ${totalSize} bytes, actually open: ${framesOpen}`,
		);
	};

	const getCacheStats = async () => {
		let count = 0;
		let totalSize = 0;
		for (const src in sources) {
			for (const bank in sources[src]) {
				const v = await sources[src][bank];
				const {length, size} = v.getOpenFrameCount();
				count += length;
				totalSize += size;
				if (size === 0) {
					continue;
				}
			}
		}

		return {count, totalSize};
	};

	const clearKeyframeBanksBeforeTime = async ({
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
			const bank = await sources[src][startTimeInSeconds as unknown as number];
			const {endTimestampInSeconds} = bank;

			if (endTimestampInSeconds < threshold) {
				await bank.prepareForDeletion();
				Log.verbose(
					logLevel,
					`[NewVideo] Cleared frames for src ${src} from ${bank.startTimestampInSeconds}sec to ${bank.endTimestampInSeconds}sec`,
				);
				delete sources[src][startTimeInSeconds as unknown as number];
			} else {
				bank.deleteFramesBeforeTimestamp({
					timestampInSeconds: threshold,
					logLevel,
					src,
				});
			}
		}

		await logCacheStats(logLevel);
	};

	const getKeyframeBankOrRefetch = async ({
		packetSink,
		timestamp,
		videoSampleSink,
		src,
		logLevel,
	}: {
		packetSink: EncodedPacketSink;
		timestamp: number;
		videoSampleSink: VideoSampleSink;
		src: string;
		logLevel: LogLevel;
	}) => {
		const startPacket = await packetSink.getKeyPacket(timestamp, {
			verifyKeyPackets: true,
		});

		if (!startPacket) {
			throw new Error(`No key packet found for timestamp ${timestamp}`);
		}

		const startTimestampInSeconds = startPacket.timestamp;
		const existingBank = sources[src]?.[startTimestampInSeconds];

		// Bank does not yet exist, we need to fetch
		if (!existingBank) {
			const newKeyframeBank = getFramesSinceKeyframe({
				packetSink,
				videoSampleSink,
				startPacket,
			});

			addKeyframeBank({src, bank: newKeyframeBank, startTimestampInSeconds});

			return newKeyframeBank;
		}

		// Bank exists and still has the frame we want
		if (await (await existingBank).hasTimestampInSecond(timestamp)) {
			return existingBank;
		}

		Log.verbose(
			logLevel,
			`[NewVideo] Bank exists but frames have already been evicted!`,
		);

		// Bank exists but frames have already been evicted!
		// First delete it entirely
		await (await existingBank).prepareForDeletion();
		delete sources[src][startTimestampInSeconds];

		// Then refetch
		const replacementKeybank = getFramesSinceKeyframe({
			packetSink,
			videoSampleSink,
			startPacket,
		});

		addKeyframeBank({src, bank: replacementKeybank, startTimestampInSeconds});

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
		await clearKeyframeBanksBeforeTime({
			timestampInSeconds: timestamp,
			src,
			logLevel,
		});

		const keyframeBank = await getKeyframeBankOrRefetch({
			packetSink,
			timestamp,
			videoSampleSink,
			src,
			logLevel,
		});

		return keyframeBank;
	};

	return {
		requestKeyframeBank,
		addKeyframeBank,
		getCacheStats,
	};
};

export type KeyframeManager = Awaited<ReturnType<typeof makeKeyframeManager>>;
