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
			const index = samples.findIndex((s) => s.offset === offset);
			if (index !== -1) {
				return samples[index];
			}

			samples.push({offset, index: samples.length, size});
			return samples[samples.length - 1];
		},
		getSamples: () => samples,
		audioSamples,
	};
};

export type AacState = ReturnType<typeof aacState>;
