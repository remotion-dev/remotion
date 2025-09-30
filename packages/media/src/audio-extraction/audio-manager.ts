import type {AudioSampleSink} from 'mediabunny';
import type {LogLevel} from 'remotion';
import {getMaxVideoCacheSize, getTotalCacheStats} from '../caches';
import type {RememberActualMatroskaTimestamps} from '../video-extraction/remember-actual-matroska-timestamps';
import type {AudioSampleIterator} from './audio-iterator';
import {makeAudioIterator} from './audio-iterator';

export const makeAudioManager = () => {
	const iterators: AudioSampleIterator[] = [];

	const makeIterator = ({
		timeInSeconds,
		src,
		audioSampleSink,
		isMatroska,
		actualMatroskaTimestamps,
		logLevel,
	}: {
		timeInSeconds: number;
		src: string;
		audioSampleSink: AudioSampleSink;
		isMatroska: boolean;
		actualMatroskaTimestamps: RememberActualMatroskaTimestamps;
		logLevel: LogLevel;
	}) => {
		const iterator = makeAudioIterator({
			audioSampleSink,
			isMatroska,
			startTimestamp: timeInSeconds,
			src,
			actualMatroskaTimestamps,
			logLevel,
		});

		iterators.push(iterator);

		return iterator;
	};

	const getIteratorMostInThePast = () => {
		let mostInThePast = null;
		let mostInThePastIterator = null;
		for (const iterator of iterators) {
			const lastUsed = iterator.getLastUsed();
			if (mostInThePast === null || lastUsed < mostInThePast) {
				mostInThePast = lastUsed;
				mostInThePastIterator = iterator;
			}
		}

		return mostInThePastIterator;
	};

	const deleteOldestIterator = async () => {
		const iterator = getIteratorMostInThePast();
		if (iterator) {
			await iterator.prepareForDeletion();
			iterators.splice(iterators.indexOf(iterator), 1);
		}
	};

	const getIterator = async ({
		src,
		timeInSeconds,
		audioSampleSink,
		isMatroska,
		actualMatroskaTimestamps,
		logLevel,
	}: {
		src: string;
		timeInSeconds: number;
		audioSampleSink: AudioSampleSink;
		isMatroska: boolean;
		actualMatroskaTimestamps: RememberActualMatroskaTimestamps;
		logLevel: LogLevel;
	}) => {
		const maxCacheSize = getMaxVideoCacheSize(logLevel);
		while ((await getTotalCacheStats()).totalSize > maxCacheSize) {
			await deleteOldestIterator();
		}

		for (const iterator of iterators) {
			if (
				iterator.src === src &&
				(await iterator.waitForCompletion()) &&
				iterator.canSatisfyRequestedTime(timeInSeconds)
			) {
				return iterator;
			}
		}

		for (const iterator of iterators) {
			// delete iterator with same starting timestamp
			if (iterator.src === src && iterator.startTimestamp === timeInSeconds) {
				await iterator.prepareForDeletion();
				iterators.splice(iterators.indexOf(iterator), 1);
			}
		}

		return makeIterator({
			src,
			timeInSeconds,
			audioSampleSink,
			isMatroska,
			actualMatroskaTimestamps,
			logLevel,
		});
	};

	const getCacheStats = () => {
		let totalCount = 0;
		let totalSize = 0;
		for (const iterator of iterators) {
			const {count, size} = iterator.getCacheStats();
			totalCount += count;
			totalSize += size;
		}

		return {count: totalCount, totalSize};
	};

	const logOpenFrames = () => {
		for (const iterator of iterators) {
			iterator.logOpenFrames();
		}
	};

	return {
		makeIterator,
		getIterator,
		getCacheStats,
		getIteratorMostInThePast,
		logOpenFrames,
	};
};
