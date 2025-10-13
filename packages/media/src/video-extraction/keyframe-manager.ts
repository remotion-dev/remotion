import type {EncodedPacketSink, VideoSampleSink} from 'mediabunny';
import {Internals, type LogLevel} from 'remotion';
import {canBrowserUseWebGl2} from '../browser-can-use-webgl2';
import {
	getMaxVideoCacheSize,
	getTotalCacheStats,
	SAFE_BACK_WINDOW_IN_SECONDS,
} from '../caches';
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
			await mostInThePastBank.prepareForDeletion(logLevel);
			delete sources[mostInThePastSrc][
				mostInThePastBank.startTimestampInSeconds
			];
			Internals.Log.verbose(
				{logLevel, tag: '@remotion/media'},
				`Deleted frames for src ${mostInThePastSrc} from ${mostInThePastBank.startTimestampInSeconds}sec to ${mostInThePastBank.endTimestampInSeconds}sec to free up memory.`,
			);
		}
	};

	const ensureToStayUnderMaxCacheSize = async (logLevel: LogLevel) => {
		let cacheStats = await getTotalCacheStats();

		const maxCacheSize = getMaxVideoCacheSize(logLevel);
		while (cacheStats.totalSize > maxCacheSize) {
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
				await bank.prepareForDeletion(logLevel);
				Internals.Log.verbose(
					{logLevel, tag: '@remotion/media'},
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
	}): Promise<KeyframeBank | 'has-alpha' | null> => {
		const startPacket = await packetSink.getKeyPacket(timestamp, {
			verifyKeyPackets: true,
		});
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

		const startTimestampInSeconds = startPacket.timestamp;
		const existingBank = sources[src]?.[startTimestampInSeconds];

		// Bank does not yet exist, we need to fetch
		if (!existingBank) {
			const newKeyframeBank = getFramesSinceKeyframe({
				packetSink,
				videoSampleSink,
				startPacket,
				logLevel,
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
		}: {
			packetSink: EncodedPacketSink;
			timestamp: number;
			videoSampleSink: VideoSampleSink;
			src: string;
			logLevel: LogLevel;
		}) => {
			queue = queue.then(() =>
				requestKeyframeBank({
					packetSink,
					timestamp,
					videoSampleSink,
					src,
					logLevel,
				}),
			);
			return queue as Promise<KeyframeBank | 'has-alpha' | null>;
		},
		getCacheStats,
		clearAll,
	};
};

export type KeyframeManager = Awaited<ReturnType<typeof makeKeyframeManager>>;
