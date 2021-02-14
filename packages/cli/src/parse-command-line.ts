import minimist from 'minimist';
import {Config, PixelFormat} from 'remotion';

export const parseCommandLine = () => {
	const arg = minimist<{
		pixelFormat: PixelFormat;
	}>(process.argv.slice(2));
	if (arg.pixelFormat) {
		Config.PixelFormat.setPixelFormat(arg.pixelFormat);
	}
};
