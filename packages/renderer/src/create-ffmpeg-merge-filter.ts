export const createFfmpegMergeFilter = (inputs: number) => {
	return `[0:a][1:a]amix=inputs=${inputs}[a]`;
};
