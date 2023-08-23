import type {FfmpegOverrideFn} from './ffmpeg-override';

export const validateFfmpegOverride = (ffmpegArgsHook?: FfmpegOverrideFn) => {
	if (typeof ffmpegArgsHook === 'undefined') {
		return;
	}

	if (ffmpegArgsHook && typeof ffmpegArgsHook !== 'function') {
		throw new TypeError(
			`Argument passed for "ffmpegArgsHook" is not a function: ${ffmpegArgsHook}`,
		);
	}
};
