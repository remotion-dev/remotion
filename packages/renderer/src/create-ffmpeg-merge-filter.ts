import {truthy} from './truthy';

export const createFfmpegMergeFilter = (inputs: number) => {
	const leftChannel = new Array(inputs * 2)
		.fill(true)
		.map((_, i) => (i % 2 === 0 ? `c${i}` : null))
		.filter(truthy)
		.join('+');

	const rightChannel = new Array(inputs * 2)
		.fill(true)
		.map((_, i) => (i % 2 === 1 ? `c${i}` : null))
		.filter(truthy)
		.join('+');

	return `[0:a][1:a]amerge=inputs=${inputs},pan=stereo|c0=${leftChannel}|c1=${rightChannel}[a]`;
};
