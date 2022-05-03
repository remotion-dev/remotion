import {Internals} from 'remotion';

export const createFfmpegMergeFilter = (inputs: number) => {
	if (inputs === 1) {
		return null;
	}

	const leftChannel = new Array(inputs * 2)
		.fill(true)
		.map((_, i) => (i % 2 === 0 ? `c${i}` : null))
		.filter(Internals.truthy)
		.join('+');

	const rightChannel = new Array(inputs * 2)
		.fill(true)
		.map((_, i) => (i % 2 === 1 ? `c${i}` : null))
		.filter(Internals.truthy)
		.join('+');

	// TODO: This command will normalize the volume to 1 again. Should it be the default or be configurable?
	// return `[0:a][1:a]amerge=inputs=${inputs},pan=stereo|c0<${leftChannel}|c1<${rightChannel}[a]`;
	return `[0:a][1:a]amerge=inputs=${inputs},pan=stereo|c0=${leftChannel}|c1=${rightChannel}[a]`;
};
