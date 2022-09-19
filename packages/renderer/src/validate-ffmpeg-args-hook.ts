import type {FfmpegArgsHook} from './ffmpeg-args-hook';

export const validateFfmpegArgsHook = (ffmpegArgsHook?: FfmpegArgsHook) => {
	if (typeof ffmpegArgsHook === 'undefined') {
		return;
	}

	if (ffmpegArgsHook && typeof ffmpegArgsHook !== 'function') {
		throw new TypeError(
			`Argument passed for "ffmpegArgsHook" is not a function: ${ffmpegArgsHook}`
		);
	}
};
