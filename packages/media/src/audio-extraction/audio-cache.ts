import type {AudioSample} from 'mediabunny';

export const makeAudioCache = () => {
	const timestamps: number[] = [];
	const samples: Record<number, AudioSample> = {};

	const addFrame = (sample: AudioSample) => {
		timestamps.push(sample.timestamp);
		samples[sample.timestamp] = sample;
	};

	const clearBeforeThreshold = (threshold: number) => {
		for (const timestamp of timestamps.slice()) {
			const endTimestamp = timestamp + samples[timestamp].duration;

			if (endTimestamp < threshold) {
				const isLast = timestamp === timestamps[timestamps.length - 1];
				if (isLast) {
					continue;
				}

				samples[timestamp].close();
				delete samples[timestamp];
				timestamps.splice(timestamps.indexOf(timestamp), 1);
			}
		}
	};

	const deleteAll = () => {
		for (const timestamp of timestamps) {
			samples[timestamp].close();
			delete samples[timestamp];
		}

		timestamps.length = 0;
	};

	const getSamples = (timestamp: number, durationInSeconds: number) => {
		const selected: AudioSample[] = [];
		for (let i = 0; i < timestamps.length; i++) {
			const sampleTimestamp = timestamps[i];
			const sample = samples[sampleTimestamp];

			if (sample.timestamp + sample.duration - 0.0000000001 <= timestamp) {
				continue;
			}

			if (sample.timestamp >= timestamp + durationInSeconds - 0.0000000001) {
				break;
			}

			selected.push(sample);
		}

		return selected;
	};

	const getOpenTimestamps = () => {
		return timestamps;
	};

	const getOldestTimestamp = () => {
		return timestamps[0];
	};

	const getNewestTimestamp = () => {
		if (timestamps.length === 0) {
			return null;
		}

		const sample = samples[timestamps[timestamps.length - 1]];
		return sample.timestamp + sample.duration;
	};

	return {
		addFrame,
		clearBeforeThreshold,
		deleteAll,
		getSamples,
		getOldestTimestamp,
		getNewestTimestamp,
		getOpenTimestamps,
	};
};

export type AudioCache = ReturnType<typeof makeAudioCache>;
