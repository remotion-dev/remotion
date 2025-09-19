import type {EncodedPacketSink, VideoSampleSink} from 'mediabunny';
import {
	getTotalCacheStats,
	MAX_CACHE_SIZE,
	SAFE_BACK_WINDOW_IN_SECONDS,
} from '../caches';
import type {LogLevel} from '../log';
import {Log} from '../log';
import {getFramesSinceKeyframe} from './get-frames-since-keyframe';
import {type KeyframeBank} from './keyframe-bank';

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
				const {size, timestamps} = v.getOpenFrameCount();
				count += timestamps.length;
				totalSize += size;
				if (size === 0) {
					continue;
				}

				Log.verbose(
					logLevel,
					`[Video] Open frames for src ${src}: ${timestamps.join(', ')}`,
				);
			}
		}

		Log.verbose(
			logLevel,
			`[Video] Cache stats: ${count} open frames, ${totalSize} bytes`,
		);
	};

	const getCacheStats = async () => {
		let count = 0;
		let totalSize = 0;

		for (const src in sources) {
			for (const bank in sources[src]) {
				const v = await sources[src][bank];
				const {timestamps, size} = v.getOpenFrameCount();
				count += timestamps.length;
				totalSize += size;
				if (size === 0) {
					continue;
				}
			}
		}

		return {count, totalSize};
	};

	const getTheKeyframeBankMostInThePast = async () => {
		let mostInThePast = null;
		let mostInThePastBank = null;

		for (const src in sources) {
			for (const b in sources[src]) {
				const bank = await sources[src][b];

				const lastUsed = bank.getLastUsed();
				if (mostInThePast === null || lastUsed < mostInThePast) {
					mostInThePast = lastUsed;
					mostInThePastBank = {src, bank};
				}
			}
		}

		if (!mostInThePastBank) {
			throw new Error('No keyframe bank found');
		}

		return mostInThePastBank;
	};

	const deleteOldestKeyframeBank = async (logLevel: LogLevel) => {
		const {bank: mostInThePastBank, src: mostInThePastSrc} =
			await getTheKeyframeBankMostInThePast();

		if (mostInThePastBank) {
			await mostInThePastBank.prepareForDeletion();
			delete sources[mostInThePastSrc][
				mostInThePastBank.startTimestampInSeconds
			];
			Log.verbose(
				logLevel,
				`[Video] Deleted frames for src ${mostInThePastSrc} from ${mostInThePastBank.startTimestampInSeconds}sec to ${mostInThePastBank.endTimestampInSeconds}sec to free up memory.`,
			);
		}
	};

	const ensureToStayUnderMaxCacheSize = async (logLevel: LogLevel) => {
		let cacheStats = await getTotalCacheStats();

		while (cacheStats.totalSize > MAX_CACHE_SIZE) {
			await deleteOldestKeyframeBank(logLevel);
			cacheStats = await getTotalCacheStats();
		}
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
		const threshold = timestampInSeconds - SAFE_BACK_WINDOW_IN_SECONDS;

		if (!sources[src]) {
			return;
		}

		const banks = Object.keys(sources[src]);

		for (const startTimeInSeconds of banks) {
			const bank = await sources[src][startTimeInSeconds as unknown as number];
			const {endTimestampInSeconds, startTimestampInSeconds} = bank;

			if (endTimestampInSeconds < threshold) {
				await bank.prepareForDeletion();
				Log.verbose(
					logLevel,
					`[Video] Cleared frames for src ${src} from ${startTimestampInSeconds}sec to ${endTimestampInSeconds}sec`,
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
			`[Video] Bank exists but frames have already been evicted!`,
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
		await ensureToStayUnderMaxCacheSize(logLevel);

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

	const clearAll = async () => {
		const srcs = Object.keys(sources);
		for (const src of srcs) {
			const banks = Object.keys(sources[src]);

			for (const startTimeInSeconds of banks) {
				const bank =
					await sources[src][startTimeInSeconds as unknown as number];

				await bank.prepareForDeletion();
				delete sources[src][startTimeInSeconds as unknown as number];
			}
		}
	};

	return {
		requestKeyframeBank,
		addKeyframeBank,
		getCacheStats,
		clearAll,
	};
};

export type KeyframeManager = Awaited<ReturnType<typeof makeKeyframeManager>>;
