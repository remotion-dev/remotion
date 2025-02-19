export type FfmpegOverrideFn = (info: {
	type: 'pre-stitcher' | 'stitcher';
	args: string[];
}) => string[];
