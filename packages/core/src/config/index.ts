import {PixelFormat, setPixelFormat} from './pixel-format';

export const Config = {
	PixelFormat: {
		/**
		 * Sets the pixel format in FFMPEG.
		 * See https://trac.ffmpeg.org/wiki/Chroma%20Subsampling for an explanation.
		 * You can override this using the `--pixel-format` Cli flag.
		 */
		setPixelFormat,
	},
};

export type {PixelFormat};
