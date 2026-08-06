import type {VideoSampleSink} from 'mediabunny';
import {Internals, type LogLevel} from 'remotion';
import {getSafeWindowOfMonotonicity, getTotalCacheStats} from '../caches';
import {renderTimestampRange} from '../render-timestamp-range';
import {type KeyframeBank, makeKeyframeBank} from './keyframe-bank';

// A bank that was returned within the last N requests for the same src is
// treated as belonging to another active playhead (a second <Video> of the
// same src, mounted at a different timeline position) and is exempt from
// timestamp-based clearing. Without this, the layer furthest ahead in the
// file deletes the other layers' banks on every request, forcing each of
// them to re-seek and re-decode from the previous keyframe for every frame.
// Memory is still bounded: banks that age out of the window are cleared
// here as before, and `ensureToStayUnderMaxCacheSize()` evicts
// least-recently-used banks whenever the cache exceeds its budget.
const RECENTLY_USED_REQUEST_COUNT = 50;

export const makeKeyframeManager = () => {
	let sources: Record<string, KeyframeBank[]> = {};

	// How many times a bank has been requested for a given src, and at which
	// request each bank was last handed out. Used to detect banks that other
	// concurrently-mounted components are actively reading from.
	let requestCountForSrc: Record<string, number> = {};
	const lastRequestForBank = new WeakMap<KeyframeBank, number>();

	const addKeyframeBank = ({src, bank}: {src: string; bank: KeyframeBank}) => {
		sources[src] = sources[src] ?? [];
		sources[src].push(bank);
	};

	const logCacheStats = (logLevel: LogLevel) => {
		let count = 0;
		let totalSize = 0;

		for (const src in sources) {
			for (const bank of sources[src]) {
				const {size, timestamps} = bank.getOpenFrameCount();
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

	const getCacheStats = () => {
		let count = 0;
		let totalSize = 0;

		for (const src in sources) {
			for (const bank of sources[src]) {
				const {timestamps, size} = bank.getOpenFrameCount();
				count += timestamps.length;
				totalSize += size;
				if (size === 0) {
					continue;
				}
			}
		}

		return {count, totalSize};
	};

	const getTheKeyframeBankMostInThePast = () => {
		let mostInThePast = null;
		let mostInThePastBank = null;

		let numberOfBanks = 0;

		for (const src in sources) {
			for (const bank of sources[src]) {
				const index = sources[src].indexOf(bank);

				const lastUsed = bank.getLastUsed();
				if (mostInThePast === null || lastUsed < mostInThePast) {
					mostInThePast = lastUsed;
					mostInThePastBank = {src, bank, index};
				}

				numberOfBanks++;
			}
		}

		if (!mostInThePastBank) {
			throw new Error('No keyframe bank found');
		}

		return {mostInThePastBank, numberOfBanks};
	};

	const deleteOldestKeyframeBank = (logLevel: LogLevel): {finish: boolean} => {
		const {
			mostInThePastBank: {
				bank: mostInThePastBank,
				src: mostInThePastSrc,
				index: mostInThePastIndex,
			},
			numberOfBanks,
		} = getTheKeyframeBankMostInThePast();

		if (numberOfBanks < 2) {
			return {finish: true};
		}

		if (mostInThePastBank) {
			const range = mostInThePastBank.getRangeOfTimestamps();
			const {framesDeleted} = mostInThePastBank.prepareForDeletion(
				logLevel,
				'deleted oldest keyframe bank to stay under max cache size',
			);
			sources[mostInThePastSrc].splice(mostInThePastIndex, 1);
			if (range) {
				Internals.Log.verbose(
					{logLevel, tag: '@remotion/media'},
					`Deleted ${framesDeleted} frames for src ${mostInThePastSrc} from ${range?.firstTimestamp}sec to ${range?.lastTimestamp}sec to free up memory.`,
				);
			}
		}

		return {finish: false};
	};

	const ensureToStayUnderMaxCacheSize = (
		logLevel: LogLevel,
		maxCacheSize: number,
	) => {
		let cacheStats = getTotalCacheStats();
		let attempts = 0;
		const maxAttempts = 3;

		while (cacheStats.totalSize > maxCacheSize && attempts < maxAttempts) {
			const {finish} = deleteOldestKeyframeBank(logLevel);
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

			cacheStats = getTotalCacheStats();
			attempts++;
		}

		if (cacheStats.totalSize > maxCacheSize && attempts >= maxAttempts) {
			Internals.Log.warn(
				{logLevel, tag: '@remotion/media'},
				`Exceeded max cache size after ${maxAttempts} attempts. Remaining cache size: ${(cacheStats.totalSize / 1024 / 1024).toFixed(1)} MB, target was ${(maxCacheSize / 1024 / 1024).toFixed(1)} MB.`,
			);
		}
	};

	const clearKeyframeBanksBeforeTime = ({
		timestampInSeconds,
		src,
		logLevel,
		fps,
	}: {
		timestampInSeconds: number;
		src: string;
		logLevel: LogLevel;
		fps: number;
	}) => {
		const threshold = timestampInSeconds - getSafeWindowOfMonotonicity(fps);

		if (!sources[src]) {
			return;
		}

		const banks = sources[src];
		const currentRequest = requestCountForSrc[src] ?? 0;

		for (const bank of banks) {
			const range = bank.getRangeOfTimestamps();
			if (!range) {
				continue;
			}

			// Don't clear (or trim) a bank another playhead is actively reading
			// from, even if it lies behind this request's timestamp.
			const lastRequest = lastRequestForBank.get(bank);
			if (
				lastRequest !== undefined &&
				currentRequest - lastRequest < RECENTLY_USED_REQUEST_COUNT
			) {
				continue;
			}

			if (range.lastTimestamp < threshold) {
				bank.prepareForDeletion(
					logLevel,
					'cleared before threshold ' + threshold,
				);
				Internals.Log.verbose(
					{logLevel, tag: '@remotion/media'},
					`[Video] Cleared frames for src ${src} from ${range.firstTimestamp}sec to ${range.lastTimestamp}sec`,
				);
				const bankIndex = banks.indexOf(bank);
				delete sources[src][bankIndex];
			} else {
				bank.deleteFramesBeforeTimestamp({
					timestampInSeconds: threshold,
					logLevel,
				});
			}
		}

		sources[src] = sources[src].filter((bank) => bank !== undefined);

		logCacheStats(logLevel);
	};

	const getKeyframeBankOrRefetch = async ({
		timestamp,
		videoSampleSink,
		src,
		logLevel,
	}: {
		timestamp: number;
		videoSampleSink: VideoSampleSink;
		src: string;
		logLevel: LogLevel;
	}): Promise<KeyframeBank | null> => {
		// The start packet timestamp can be higher than the packets following it
		// https://discord.com/channels/809501355504959528/1001500302375125055/1456710188865159343
		// e.g. key packet timestamp is 0.08sec, but the next packet is 0.04sec
		const existingBanks = sources[src] ?? [];
		const existingBank = existingBanks?.find((bank) =>
			bank.canSatisfyTimestamp(timestamp),
		);

		// Bank does not yet exist, we need to fetch
		if (!existingBank) {
			Internals.Log.trace(
				{logLevel, tag: '@remotion/media'},
				`Creating new keyframe bank for src ${src} at timestamp ${timestamp}`,
			);
			const newKeyframeBank = await makeKeyframeBank({
				videoSampleSink,
				logLevel,
				src,
				initialTimestampRequest: timestamp,
			});

			addKeyframeBank({src, bank: newKeyframeBank});

			return newKeyframeBank;
		}

		// Bank exists and still has the frame we want
		if (existingBank.canSatisfyTimestamp(timestamp)) {
			Internals.Log.trace(
				{logLevel, tag: '@remotion/media'},
				`Keyframe bank exists and satisfies timestamp ${timestamp}`,
			);
			return existingBank;
		}

		Internals.Log.verbose(
			{logLevel, tag: '@remotion/media'},
			`Keyframe bank exists but frame at time ${timestamp} does not exist anymore.`,
		);

		// Bank exists but frames have already been evicted!
		// First delete it entirely
		existingBank.prepareForDeletion(logLevel, 'already existed but evicted');
		sources[src] = sources[src].filter((bank) => bank !== existingBank);

		// Then refetch
		const replacementKeybank = await makeKeyframeBank({
			videoSampleSink,
			initialTimestampRequest: timestamp,
			logLevel,
			src,
		});

		addKeyframeBank({src, bank: replacementKeybank});

		return replacementKeybank;
	};

	const requestKeyframeBank = async ({
		timestamp,
		videoSampleSink,
		src,
		logLevel,
		maxCacheSize,
		fps,
	}: {
		timestamp: number;
		videoSampleSink: VideoSampleSink;
		src: string;
		logLevel: LogLevel;
		maxCacheSize: number;
		fps: number;
	}) => {
		requestCountForSrc[src] = (requestCountForSrc[src] ?? 0) + 1;

		ensureToStayUnderMaxCacheSize(logLevel, maxCacheSize);

		clearKeyframeBanksBeforeTime({
			timestampInSeconds: timestamp,
			src,
			logLevel,
			fps,
		});

		const keyframeBank = await getKeyframeBankOrRefetch({
			timestamp,
			videoSampleSink,
			src,
			logLevel,
		});

		if (keyframeBank) {
			lastRequestForBank.set(keyframeBank, requestCountForSrc[src]);
		}

		return keyframeBank;
	};

	const clearAll = (logLevel: LogLevel) => {
		const srcs = Object.keys(sources);
		for (const src of srcs) {
			const banks = sources[src];

			for (const bank of banks) {
				bank.prepareForDeletion(logLevel, 'clearAll');
			}

			sources[src] = [];
		}

		sources = {};
		requestCountForSrc = {};
	};

	let queue = Promise.resolve<unknown>(undefined);

	return {
		requestKeyframeBank: ({
			timestamp,
			videoSampleSink,
			src,
			logLevel,
			maxCacheSize,
			fps,
		}: {
			timestamp: number;
			videoSampleSink: VideoSampleSink;
			src: string;
			logLevel: LogLevel;
			maxCacheSize: number;
			fps: number;
		}) => {
			queue = queue.then(() =>
				requestKeyframeBank({
					timestamp,
					videoSampleSink,
					src,
					logLevel,
					maxCacheSize,
					fps,
				}),
			);
			return queue as Promise<KeyframeBank>;
		},
		getCacheStats,
		clearAll,
	};
};

export type KeyframeManager = Awaited<ReturnType<typeof makeKeyframeManager>>;
