type AacSamplePosition = {
	offset: number;
	index: number;
	size: number;
};

export const aacState = () => {
	const samples: AacSamplePosition[] = [];

	return {
		addSample: ({offset, size}: {offset: number; size: number}) => {
			if (samples.find((s) => s.offset === offset)) {
				throw new Error('Duplicate sample');
			}

			samples.push({offset, index: samples.length, size});
			return samples[samples.length - 1];
		},
		getSamples: () => samples,
	};
};
