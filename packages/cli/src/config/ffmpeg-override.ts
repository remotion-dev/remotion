import type {FfmpegOverrideFn} from '@remotion/renderer';

const defaultFfmpegOverrideFn: FfmpegOverrideFn = ({args}) => args;

let ffmpegOverrideFn: FfmpegOverrideFn = defaultFfmpegOverrideFn;

export const setFfmpegOverrideFunction = (fn: FfmpegOverrideFn) => {
	ffmpegOverrideFn = fn;
};

export const getFfmpegOverrideFunction = () => {
	return ffmpegOverrideFn;
};

export const resetFfmpegOverrideFunction = () => {
	ffmpegOverrideFn = defaultFfmpegOverrideFn;
};
