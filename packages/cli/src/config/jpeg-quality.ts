import {RenderInternals} from '@remotion/renderer';

const defaultValue = RenderInternals.DEFAULT_JPEG_QUALITY;
let quality: number = defaultValue;

export const setJpegQuality = (q: number | undefined) => {
	RenderInternals.validateJpegQuality(q);

	if (q === 0 || q === undefined) {
		quality = defaultValue;
		return;
	}

	quality = q;
};

export const getJpegQuality = () => quality;
