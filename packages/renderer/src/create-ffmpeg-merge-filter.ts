export const createFfmpegMergeFilter = (inputs: number) => {
	return `[0:a][1:a]amix=inputs=${inputs}:dropout_transition=0:normalize=0[a]`;
};
