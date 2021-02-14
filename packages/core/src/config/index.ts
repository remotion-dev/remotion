import {Concurrency, setConcurrency} from './concurrency';
import {setOverwriteOutput} from './overwrite';
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
	Output: {
		/**
		 * If the video file already exists, should Remotion overwrite
		 * the output?
		 */
		setOverwriteOutput,
	},
	Concurrency: {
		/**
		 * Sets how many Puppeteer instances will work on rendering your video in parallel.
		 * Default: `null`, meaning half of the threads available on your CPU.
		 */
		setConcurrency,
	},
};

export type {PixelFormat, Concurrency};
