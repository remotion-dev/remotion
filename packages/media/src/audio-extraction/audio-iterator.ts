import type {AudioSample, AudioSampleSink} from 'mediabunny';
import type {LogLevel} from '../log';
import {Log} from '../log';
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

	const getNextSample = async () => {
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
		if (fullDuration !== null && timestamp > fullDuration) {
			return [];
		}

		// Clear all samples before the timestamp
		// Do this in the while loop because samples might start from 0
		cache.clearBeforeThreshold(timestamp - 1);

		const samples: AudioSample[] = cache.getSamples(
			timestamp,
			durationInSeconds,
		);

		while (true) {
			const sample = await getNextSample();
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
			'Open audio samples for src',
			src,
			cache
				.getOpenTimestamps()
				.map((t) => t.toFixed(3))
				.join(', '),
		);
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
	};
};

export type AudioSampleIterator = ReturnType<typeof makeAudioIterator>;
