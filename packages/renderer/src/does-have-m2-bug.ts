import {cpus} from 'os';
import type {Codec} from './codec';
import type {PixelFormat} from './pixel-format';

export const warnAboutM2Bug = (
	codec: Codec | null,
	pixelFormat: PixelFormat | null
) => {
	const isM2 = cpus().find((c) => c.model.includes('Apple M2'));
	if (codec === 'prores' && pixelFormat === 'yuv422p10le' && isM2) {
		console.warn();
		console.warn(
			'⚠️ Known issue: Apple M2 CPUs currently suffer from a bug where transparent ProRes videos have flickering. https://github.com/remotion-dev/remotion/issues/1929'
		);
	}
};
