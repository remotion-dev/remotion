import type {AudioSample} from 'mediabunny';

export const makeAudioCache = () => {
	const timestamps: number[] = [];
	const samples: Record<number, AudioSample> = {};

	const addFrame = (sample: AudioSample) => {
		timestamps.push(sample.timestamp);
		samples[sample.timestamp] = sample;
	};

	const clearBeforeThreshold = (threshold: number) => {
		for (const timestamp of timestamps) {
			const endTimestamp = timestamp + samples[timestamp].duration;

			if (endTimestamp < threshold) {
				delete samples[timestamp];
				timestamps.splice(timestamps.indexOf(timestamp), 1);
			}
		}
	};

	const deleteAll = () => {
		for (const timestamp of timestamps) {
			delete samples[timestamp];
		}

		timestamps.length = 0;
	};

	return {
		addFrame,
		clearBeforeThreshold,
		deleteAll,
	};
};

export type AudioCache = ReturnType<typeof makeAudioCache>;
