import {audioSampleMapState} from './audio-sample-map';

export const flacState = () => {
	let blockingBitStrategy: undefined | number;
	const audioSamples = audioSampleMapState();

	return {
		setBlockingBitStrategy: (strategy: number) => {
			blockingBitStrategy = strategy;
		},
		getBlockingBitStrategy: () => blockingBitStrategy,
		audioSamples,
	};
};

export type FlacState = ReturnType<typeof flacState>;
