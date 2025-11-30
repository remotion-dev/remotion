import type {AudioSampleSink} from 'mediabunny';
import {Internals, type LogLevel} from 'remotion';
import {getTotalCacheStats} from '../caches';
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
	}): AudioSampleIterator => {
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

	const deleteOldestIterator = () => {
		const iterator = getIteratorMostInThePast();
		if (iterator) {
			iterator.prepareForDeletion();
			iterators.splice(iterators.indexOf(iterator), 1);
		}
	};

	const deleteDuplicateIterators = (logLevel: LogLevel) => {
		const seenKeys = new Set<string>();
		for (let i = 0; i < iterators.length; i++) {
			const iterator = iterators[i];
			const key = `${iterator.src}-${iterator.getOldestTimestamp()}-${iterator.getNewestTimestamp()}`;

			if (seenKeys.has(key)) {
				iterator.prepareForDeletion();
				iterators.splice(iterators.indexOf(iterator), 1);
				Internals.Log.verbose(
					{logLevel, tag: '@remotion/media'},
					`Deleted duplicate iterator for ${iterator.src}`,
				);
			}

			seenKeys.add(key);
		}
	};

	const getIterator = async ({
		src,
		timeInSeconds,
		audioSampleSink,
		isMatroska,
		actualMatroskaTimestamps,
		logLevel,
		maxCacheSize,
	}: {
		src: string;
		timeInSeconds: number;
		audioSampleSink: AudioSampleSink;
		isMatroska: boolean;
		actualMatroskaTimestamps: RememberActualMatroskaTimestamps;
		logLevel: LogLevel;
		maxCacheSize: number;
	}) => {
		while ((await getTotalCacheStats()).totalSize > maxCacheSize) {
			deleteOldestIterator();
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

		for (let i = 0; i < iterators.length; i++) {
			const iterator = iterators[i];
			// delete iterator with same starting timestamp as requested
			if (iterator.src === src && iterator.startTimestamp === timeInSeconds) {
				iterator.prepareForDeletion();
				iterators.splice(iterators.indexOf(iterator), 1);
			}
		}

		deleteDuplicateIterators(logLevel);

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

	let queue = Promise.resolve<unknown>(undefined);

	return {
		getIterator: ({
			src,
			timeInSeconds,
			audioSampleSink,
			isMatroska,
			actualMatroskaTimestamps,
			logLevel,
			maxCacheSize,
		}: {
			src: string;
			timeInSeconds: number;
			audioSampleSink: AudioSampleSink;
			isMatroska: boolean;
			actualMatroskaTimestamps: RememberActualMatroskaTimestamps;
			logLevel: LogLevel;
			maxCacheSize: number;
		}) => {
			queue = queue.then(() =>
				getIterator({
					src,
					timeInSeconds,
					audioSampleSink,
					isMatroska,
					actualMatroskaTimestamps,
					logLevel,
					maxCacheSize,
				}),
			);
			return queue as Promise<AudioSampleIterator>;
		},
		getCacheStats,
		getIteratorMostInThePast,
		logOpenFrames,
		deleteDuplicateIterators,
	};
};
