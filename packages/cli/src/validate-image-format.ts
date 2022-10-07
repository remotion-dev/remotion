import type {ImageFormat} from '@remotion/renderer';
import {Log} from './log';

export const validateImageFormat = (
	imageFormat: ImageFormat,
	outName: string | null
) => {
	if (imageFormat === 'png' && !outName?.endsWith('.png')) {
		Log.warn(`Rendering a PNG, expected a .png extension but got ${outName}`);
	}

	if (
		imageFormat === 'jpeg' &&
		!outName?.endsWith('.jpg') &&
		!outName?.endsWith('.jpeg')
	) {
		Log.warn(
			`Rendering a JPEG, expected a .jpg or .jpeg extension but got ${outName}`
		);
	}
};
