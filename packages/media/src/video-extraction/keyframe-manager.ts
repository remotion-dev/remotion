import type {EncodedPacketSink, VideoSampleSink} from 'mediabunny';
import {Internals, type LogLevel} from 'remotion';
import {canBrowserUseWebGl2} from '../browser-can-use-webgl2';
import {getTotalCacheStats, SAFE_WINDOW_OF_MONOTONICITY} from '../caches';
import {renderTimestampRange} from '../render-timestamp-range';
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

				Internals.Log.verbose(
					{logLevel, tag: '@remotion/media'},
					`Open frames for src ${src}: ${renderTimestampRange(timestamps)}`,
				);
			}
		}

		Internals.Log.verbose(
			{logLevel, tag: '@remotion/media'},
			`Video cache stats: ${count} open frames, ${totalSize} bytes`,
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

		let numberOfBanks = 0;

		for (const src in sources) {
			for (const b in sources[src]) {
				const bank = await sources[src][b];

				const lastUsed = bank.getLastUsed();
				if (mostInThePast === null || lastUsed < mostInThePast) {
					mostInThePast = lastUsed;
					mostInThePastBank = {src, bank};
				}

				numberOfBanks++;
			}
		}

		if (!mostInThePastBank) {
			throw new Error('No keyframe bank found');
		}

		return {mostInThePastBank, numberOfBanks};
	};

	const deleteOldestKeyframeBank = async (
		logLevel: LogLevel,
	): Promise<{finish: boolean}> => {
		const {
			mostInThePastBank: {bank: mostInThePastBank, src: mostInThePastSrc},
			numberOfBanks,
		} = await getTheKeyframeBankMostInThePast();

		if (numberOfBanks < 2) {
			return {finish: true};
		}

		if (mostInThePastBank) {
			const {framesDeleted} = mostInThePastBank.prepareForDeletion(logLevel);
			delete sources[mostInThePastSrc][
				mostInThePastBank.startTimestampInSeconds
			];
			Internals.Log.verbose(
				{logLevel, tag: '@remotion/media'},
				`Deleted ${framesDeleted} frames for src ${mostInThePastSrc} from ${mostInThePastBank.startTimestampInSeconds}sec to ${mostInThePastBank.endTimestampInSeconds}sec to free up memory.`,
			);
		}

		return {finish: false};
	};

	const ensureToStayUnderMaxCacheSize = async (
		logLevel: LogLevel,
		maxCacheSize: number,
	) => {
		let cacheStats = await getTotalCacheStats();
		let attempts = 0;
		const maxAttempts = 3;

		while (cacheStats.totalSize > maxCacheSize && attempts < maxAttempts) {
			const {finish} = await deleteOldestKeyframeBank(logLevel);
			if (finish) {
				break;
			}

			Internals.Log.verbose(
				{logLevel, tag: '@remotion/media'},
				'Deleted oldest keyframe bank to stay under max cache size',
				(cacheStats.totalSize / 1024 / 1024).toFixed(1),
				'out of',
				(maxCacheSize / 1024 / 1024).toFixed(1),
			);

			cacheStats = await getTotalCacheStats();
			attempts++;
		}

		if (cacheStats.totalSize > maxCacheSize && attempts >= maxAttempts) {
			Internals.Log.warn(
				{logLevel, tag: '@remotion/media'},
				`Exceeded max cache size after ${maxAttempts} attempts. Remaining cache size: ${(cacheStats.totalSize / 1024 / 1024).toFixed(1)} MB, target was ${(maxCacheSize / 1024 / 1024).toFixed(1)} MB.`,
			);
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
		const threshold = timestampInSeconds - SAFE_WINDOW_OF_MONOTONICITY;

		if (!sources[src]) {
			return;
		}

		const banks = Object.keys(sources[src]);

		for (const startTimeInSeconds of banks) {
			const bank = await sources[src][startTimeInSeconds as unknown as number];
			const {endTimestampInSeconds, startTimestampInSeconds} = bank;

			if (endTimestampInSeconds < threshold) {
				bank.prepareForDeletion(logLevel);
				Internals.Log.verbose(
					{logLevel, tag: '@remotion/media'},
					`[Video] Cleared frames for src ${src} from ${startTimestampInSeconds}sec to ${endTimestampInSeconds}sec`,
				);
				delete sources[src][startTimeInSeconds as unknown as number];
			} else {
				bank.deleteFramesBeforeTimestamp({
					timestampInSeconds: threshold,
					logLevel,
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
	}): Promise<KeyframeBank | 'has-alpha' | null> => {
		// Try to get the keypacket at the requested timestamp.
		// If it returns null (timestamp is before the first keypacket), fall back to the first packet.
		// This matches mediabunny's internal behavior and handles videos that don't start at timestamp 0.
		const startPacket =
			(await packetSink.getKeyPacket(timestamp, {
				verifyKeyPackets: true,
			})) ?? (await packetSink.getFirstPacket({verifyKeyPackets: true}));

		const hasAlpha = startPacket?.sideData.alpha;
		if (hasAlpha && !canBrowserUseWebGl2()) {
			return 'has-alpha';
		}

		if (!startPacket) {
			// e.g. https://discord.com/channels/809501355504959528/809501355504959531/1424400511070765086
			// The video has an offset and the first frame is at time 0.033sec
			// we shall not crash here but handle it gracefully
			return null;
		}

		// The start packet timestamp can be higher than the packets following it
		// https://discord.com/channels/809501355504959528/1001500302375125055/1456710188865159343
		// e.g. key packet timestamp is 0.08sec, but the next packet is 0.04sec
		const startTimestampInSeconds = Math.min(timestamp, startPacket.timestamp);
		const existingBank = sources[src]?.[startTimestampInSeconds];

		// Bank does not yet exist, we need to fetch
		if (!existingBank) {
			const newKeyframeBank = getFramesSinceKeyframe({
				packetSink,
				videoSampleSink,
				startPacket,
				logLevel,
				src,
				requestedTimestamp: startTimestampInSeconds,
			});

			addKeyframeBank({src, bank: newKeyframeBank, startTimestampInSeconds});

			return newKeyframeBank;
		}

		// Bank exists and still has the frame we want
		if (await (await existingBank).hasTimestampInSecond(timestamp)) {
			return existingBank;
		}

		Internals.Log.verbose(
			{logLevel, tag: '@remotion/media'},
			`Keyframe bank exists but frame at time ${timestamp} does not exist anymore.`,
		);

		// Bank exists but frames have already been evicted!
		// First delete it entirely
		await (await existingBank).prepareForDeletion(logLevel);
		delete sources[src][startTimestampInSeconds];

		// Then refetch
		const replacementKeybank = getFramesSinceKeyframe({
			packetSink,
			videoSampleSink,
			startPacket,
			logLevel,
			src,
			requestedTimestamp: timestamp,
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
		maxCacheSize,
	}: {
		timestamp: number;
		packetSink: EncodedPacketSink;
		videoSampleSink: VideoSampleSink;
		src: string;
		logLevel: LogLevel;
		maxCacheSize: number;
	}) => {
		await ensureToStayUnderMaxCacheSize(logLevel, maxCacheSize);

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

	const clearAll = async (logLevel: LogLevel) => {
		const srcs = Object.keys(sources);
		for (const src of srcs) {
			const banks = Object.keys(sources[src]);

			for (const startTimeInSeconds of banks) {
				const bank =
					await sources[src][startTimeInSeconds as unknown as number];

				bank.prepareForDeletion(logLevel);
				delete sources[src][startTimeInSeconds as unknown as number];
			}
		}
	};

	let queue = Promise.resolve<unknown>(undefined);

	return {
		requestKeyframeBank: ({
			packetSink,
			timestamp,
			videoSampleSink,
			src,
			logLevel,
			maxCacheSize,
		}: {
			packetSink: EncodedPacketSink;
			timestamp: number;
			videoSampleSink: VideoSampleSink;
			src: string;
			logLevel: LogLevel;
			maxCacheSize: number;
		}) => {
			queue = queue.then(() =>
				requestKeyframeBank({
					packetSink,
					timestamp,
					videoSampleSink,
					src,
					logLevel,
					maxCacheSize,
				}),
			);
			return queue as Promise<KeyframeBank | 'has-alpha' | null>;
		},
		getCacheStats,
		clearAll,
	};
};

export type KeyframeManager = Awaited<ReturnType<typeof makeKeyframeManager>>;
