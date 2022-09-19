export type FfmpegArgsHook = (info: {
	type: 'pre-stitcher' | 'stitcher';
	args: string[];
}) => string[];
