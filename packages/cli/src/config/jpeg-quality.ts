import {RenderInternals} from '@remotion/renderer';

const defaultValue = undefined;
let quality: number | undefined = defaultValue;

export const setJpegQuality = (q: number | undefined) => {
	RenderInternals.validateJpegQuality(q);

	if (q === 0 || q === undefined) {
		quality = defaultValue;
		return;
	}

	quality = q;
};

export const getJpegQuality = () => quality;
