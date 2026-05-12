import type {Input} from 'mediabunny';

export const getDurationOrCompute = async (input: Input) => {
	return (
		(await input.getDurationFromMetadata(undefined, {
			skipLiveWait: true,
		})) ?? input.computeDuration(undefined, {skipLiveWait: true})
	);
};
