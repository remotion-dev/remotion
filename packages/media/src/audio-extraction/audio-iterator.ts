import type {AudioSample, AudioSampleSink} from 'mediabunny';
import {Log, type LogLevel} from 'remotion';
import {SAFE_BACK_WINDOW_IN_SECONDS} from '../caches';
import type {RememberActualMatroskaTimestamps} from '../video-extraction/remember-actual-matroska-timestamps';
import {makeAudioCache} from './audio-cache';

// https://discord.com/channels/@me/1409810025844838481/1415028953093111870
// Audio frames might have dependencies on previous and next frames so we need to decode a bit more
// and then discard it.
// The worst case seems to be FLAC files with a 65'535 sample window, which would be 1486.0ms at 44.1Khz.
// So let's set a threshold of 1.5 seconds.

const extraThreshold = 1.5;

export const makeAudioIterator = ({
	audioSampleSink,
	isMatroska,
	startTimestamp,
	src,
	actualMatroskaTimestamps,
}: {
	audioSampleSink: AudioSampleSink;
	isMatroska: boolean;
	startTimestamp: number;
	src: string;
	actualMatroskaTimestamps: RememberActualMatroskaTimestamps;
}) => {
	// Matroska timestamps are not accurate unless we start from the beginning
	// So for matroska, we need to decode all samples :(

	// https://github.com/Vanilagy/mediabunny/issues/105

	const sampleIterator = audioSampleSink.samples(
		isMatroska ? 0 : Math.max(0, startTimestamp - extraThreshold),
	);

	let fullDuration: number | null = null;

	const cache = makeAudioCache();

	let lastUsed = Date.now();

	const getNextSample = async () => {
		lastUsed = Date.now();

		const {value: sample, done} = await sampleIterator.next();
		if (done) {
			fullDuration = cache.getNewestTimestamp() ?? null;
			return null;
		}

		const realTimestamp = actualMatroskaTimestamps.getRealTimestamp(
			sample.timestamp,
		);

		if (realTimestamp !== null && realTimestamp !== sample.timestamp) {
			sample.setTimestamp(realTimestamp);
		}

		actualMatroskaTimestamps.observeTimestamp(sample.timestamp);
		actualMatroskaTimestamps.observeTimestamp(
			sample.timestamp + sample.duration,
		);

		cache.addFrame(sample);

		return sample;
	};

	const getSamples = async (timestamp: number, durationInSeconds: number) => {
		lastUsed = Date.now();

		if (fullDuration !== null && timestamp > fullDuration) {
			// Clear all samples before the timestamp
			// Do this in the while loop because samples might start from 0
			cache.clearBeforeThreshold(fullDuration - SAFE_BACK_WINDOW_IN_SECONDS);

			return [];
		}

		const samples: AudioSample[] = cache.getSamples(
			timestamp,
			durationInSeconds,
		);

		while (true) {
			const sample = await getNextSample();

			// Clear all samples before the timestamp
			// Do this in the while loop because samples might start from 0
			// Also do this after a sample has just been added, if it was the last sample we now have the duration
			// and can prevent deleting the last sample

			const deleteBefore =
				fullDuration === null ? timestamp : Math.min(timestamp, fullDuration);

			cache.clearBeforeThreshold(deleteBefore - SAFE_BACK_WINDOW_IN_SECONDS);

			if (sample === null) {
				break;
			}

			if (sample.timestamp + sample.duration - 0.0000000001 <= timestamp) {
				continue;
			}

			if (sample.timestamp >= timestamp + durationInSeconds - 0.0000000001) {
				break;
			}

			samples.push(sample);
		}

		return samples;
	};

	const logOpenFrames = (logLevel: LogLevel) => {
		Log.verbose(
			logLevel,
			'[Audio] Open samples for src',
			src,
			cache
				.getOpenTimestamps()
				.map((t) => t.toFixed(3))
				.join(', '),
		);
	};

	const getCacheStats = () => {
		return {
			count: cache.getOpenTimestamps().length,
			size: cache.getOpenTimestamps().reduce((acc, t) => acc + t, 0),
		};
	};

	const canSatisfyRequestedTime = (timestamp: number) => {
		const oldestTimestamp = cache.getOldestTimestamp() ?? startTimestamp;
		if (fullDuration !== null && timestamp > fullDuration) {
			return true;
		}

		return (
			oldestTimestamp < timestamp && Math.abs(oldestTimestamp - timestamp) < 10
		);
	};

	const prepareForDeletion = async () => {
		cache.deleteAll();
		const {value} = await sampleIterator.return();
		if (value) {
			value.close();
		}

		fullDuration = null;
	};

	let op = Promise.resolve<AudioSample[]>([]);

	return {
		src,
		getSamples: (ts: number, dur: number) => {
			op = op.then(() => getSamples(ts, dur));
			return op;
		},
		waitForCompletion: async () => {
			await op;
			return true;
		},
		canSatisfyRequestedTime,
		logOpenFrames,
		getCacheStats,
		getLastUsed: () => lastUsed,
		prepareForDeletion,
		startTimestamp,
	};
};

export type AudioSampleIterator = ReturnType<typeof makeAudioIterator>;
