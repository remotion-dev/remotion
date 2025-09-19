import type {AudioSampleSink} from 'mediabunny';
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
	}: {
		timeInSeconds: number;
		src: string;
		audioSampleSink: AudioSampleSink;
		isMatroska: boolean;
		actualMatroskaTimestamps: RememberActualMatroskaTimestamps;
	}) => {
		const iterator = makeAudioIterator({
			audioSampleSink,
			isMatroska,
			timeInSeconds,
			src,
			actualMatroskaTimestamps,
		});

		iterators.push(iterator);

		return iterator;
	};

	const getIterator = ({
		src,
		timeInSeconds,
		audioSampleSink,
		isMatroska,
		actualMatroskaTimestamps,
	}: {
		src: string;
		timeInSeconds: number;
		audioSampleSink: AudioSampleSink;
		isMatroska: boolean;
		actualMatroskaTimestamps: RememberActualMatroskaTimestamps;
	}) => {
		return makeIterator({
			src,
			timeInSeconds,
			audioSampleSink,
			isMatroska,
			actualMatroskaTimestamps,
		});
	};

	return {
		makeIterator,
		getIterator,
	};
};
