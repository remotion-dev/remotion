import {audioSampleMapState} from './audio-sample-map';

type AacSamplePosition = {
	offset: number;
	index: number;
	size: number;
};

export const aacState = () => {
	const samples: AacSamplePosition[] = [];

	// seems redunant, we could deduplicate this
	const audioSamples = audioSampleMapState();

	return {
		addSample: ({offset, size}: {offset: number; size: number}) => {
			if (samples.find((s) => s.offset === offset)) {
				throw new Error('Duplicate sample');
			}

			samples.push({offset, index: samples.length, size});
			return samples[samples.length - 1];
		},
		getSamples: () => samples,
		audioSamples,
	};
};

export type AacState = ReturnType<typeof aacState>;
